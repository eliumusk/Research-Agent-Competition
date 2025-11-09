#!/usr/bin/env python3
"""
Generate public/data/leaderboard.json from a weekly Excel export.
- No DB, no admin. Just run locally and commit the JSON.
- Also maintains src/data/prev_subscriptions.json snapshot for next week's growth calc.

Usage:
  python3 scripts/update-leaderboard.py [path_to_excel]
If no path provided, the script will auto-pick the most recently modified .xlsx in repo root.
"""
import json
import os
import re
import sys
import glob
import datetime as dt
from pathlib import Path
from typing import Optional

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DATA = ROOT / 'public' / 'data'
SRC_DATA = ROOT / 'src' / 'data'
PREV_SUBS_PATH = SRC_DATA / 'prev_subscriptions.json'
OUTPUT_JSON = PUBLIC_DATA / 'leaderboard.json'

REWARDS = [500, 300, 200]

# ---------- helpers ----------

def latest_xlsx(repo_root: Path) -> Optional[Path]:
    files = list(repo_root.glob('*.xlsx'))
    if not files:
        return None
    return max(files, key=lambda p: p.stat().st_mtime)


def to_int(val) -> int:
    if pd.isna(val):
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    s = str(val)
    s = s.replace(',', '').replace(' ', '')
    m = re.search(r'-?\d+', s)
    if not m:
        return 0
    return int(m.group(0))


def stable_top3(items, key, reverse=True):
    # stable sort: primary by key desc, secondary by appKey asc
    return sorted(items, key=lambda x: ((key(x)), x['appKey']), reverse=reverse)[:3]


def ensure_dirs():
    PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
    SRC_DATA.mkdir(parents=True, exist_ok=True)


# ---------- core ----------

def detect_sheets(xls: pd.ExcelFile):
    weekly_name = None
    cumulative_name = None
    # try by explicit expected names first
    for name in xls.sheet_names:
        if '周' in name and ('消耗' in name or '消耗量' in name):
            weekly_name = name
        if ('自' in name and '起' in name) or ('累计' in name) or ('光子消耗' in name and '起' in name):
            cumulative_name = name
    # fallback by columns signature
    if weekly_name is None:
        for name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=name)
            cols = set(map(str, df.columns))
            if {'计费时间(week)', 'app_key', '单笔光子消耗'} <= cols:
                weekly_name = name
                break
    if cumulative_name is None:
        for name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=name)
            cols = set(map(str, df.columns))
            if {'队伍', 'app_key', '订阅数'} <= cols and any('光子' in c for c in cols):
                cumulative_name = name
                break
    return weekly_name, cumulative_name


def parse_week_range(df_weekly: pd.DataFrame) -> str:
    col = None
    for c in df_weekly.columns:
        if '计费时间' in str(c):
            col = c
            break
    if col is None or df_weekly.empty:
        return ''
    return str(df_weekly.iloc[0][col])


def build_photon_top3(df_weekly: pd.DataFrame, df_cum: pd.DataFrame):
    # normalize columns
    wk = df_weekly.rename(columns={
        'app_key': 'appKey',
        '单笔光子消耗': 'photons',
    }).copy()
    wk['photons'] = wk['photons'].map(to_int)
    # aggregate by appKey just in case
    agg = wk.groupby('appKey', as_index=False)['photons'].sum()

    # map team names from cumulative if available
    team_map = {}
    if not df_cum.empty and '队伍' in df_cum.columns and 'app_key' in df_cum.columns:
        for _, r in df_cum[['队伍', 'app_key']].dropna().iterrows():
            team_map[str(r['app_key'])] = str(r['队伍'])

    items = []
    for _, r in agg.iterrows():
        app = str(r['appKey'])
        items.append({
            'appKey': app,
            'teamName': team_map.get(app, ''),
            'photons': int(r['photons'])
        })
    top3 = stable_top3(items, key=lambda x: x['photons'], reverse=True)
    for i, it in enumerate(top3[:3]):
        it['rank'] = i + 1
        it['reward'] = REWARDS[i]
    return top3


def load_prev_subs() -> dict:
    if PREV_SUBS_PATH.exists():
        try:
            return json.loads(PREV_SUBS_PATH.read_text(encoding='utf-8'))
        except Exception:
            return {}
    return {}


def save_prev_subs(mapping: dict):
    PREV_SUBS_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding='utf-8')


def build_subscription_growth_top3(df_cum: pd.DataFrame):
    # current subs mapping
    df = df_cum.rename(columns={'app_key': 'appKey'}).copy()
    df['subscriptions'] = df['订阅数'].map(to_int)

    team_map = {}
    if '队伍' in df.columns:
        for _, r in df[['队伍', 'appKey']].dropna().iterrows():
            team_map[str(r['appKey'])] = str(r['队伍'])

    curr = {str(r['appKey']): int(r['subscriptions']) for _, r in df[['appKey', 'subscriptions']].iterrows()}
    prev = load_prev_subs()

    if not prev:  # first run
        save_prev_subs(curr)
        return [], False

    items = []
    for app, subs in curr.items():
        growth = subs - int(prev.get(app, 0))
        if growth < 0:
            growth = 0
        items.append({'appKey': app, 'teamName': team_map.get(app, ''), 'growth': growth})

    top3 = stable_top3(items, key=lambda x: x['growth'], reverse=True)
    for i, it in enumerate(top3[:3]):
        it['rank'] = i + 1
        it['reward'] = REWARDS[i]

    # update snapshot for next week
    save_prev_subs(curr)
    return top3, True


def build_milestones(df_cum: pd.DataFrame):
    df = df_cum.rename(columns={'app_key': 'appKey'}).copy()
    df['subscriptions'] = df['订阅数'].map(to_int)

    photon_col = None
    for c in df.columns:
        if '光子' in str(c):
            photon_col = c
            break
    if photon_col is None:
        df['photons'] = 0
    else:
        df['photons'] = df[photon_col].map(to_int)

    subs500 = []
    pho10000 = []
    for _, r in df.iterrows():
        app = str(r['appKey'])
        team = str(r['队伍']) if '队伍' in r and pd.notna(r['队伍']) else ''
        subs = int(r['subscriptions'])
        pho = int(r['photons'])
        if subs >= 500:
            subs500.append({'appKey': app, 'teamName': team, 'subscriptions': subs, 'reward': 1000})
        if pho >= 10000:
            pho10000.append({'appKey': app, 'teamName': team, 'photons': pho, 'reward': 1000})
    return {'subscription500': subs500, 'photon10000': pho10000}


def main():
    ensure_dirs()

    xlsx_path = Path(sys.argv[1]) if len(sys.argv) > 1 else latest_xlsx(ROOT)
    if not xlsx_path or not xlsx_path.exists():
        print('❌ Excel file not found. Provide path or put a .xlsx in repo root.')
        sys.exit(1)

    xls = pd.ExcelFile(xlsx_path)
    weekly_name, cumulative_name = detect_sheets(xls)
    if not weekly_name or not cumulative_name:
        print('❌ Failed to detect required sheets (weekly consumption and cumulative stats).')
        print('Sheets found:', xls.sheet_names)
        sys.exit(1)

    df_weekly = pd.read_excel(xls, sheet_name=weekly_name)
    df_cum = pd.read_excel(xls, sheet_name=cumulative_name)

    week_range = parse_week_range(df_weekly)

    photon_top3 = build_photon_top3(df_weekly, df_cum)
    subs_top3, subs_available = build_subscription_growth_top3(df_cum)

    milestones = build_milestones(df_cum)

    out = {
        'generatedAt': dt.datetime.utcnow().isoformat() + 'Z',
        'sourceFile': xlsx_path.name,
        'weekRange': week_range,
        'subscriptionGrowthAvailable': subs_available,
        'subscriptionGrowthTop3': subs_top3,
        'photonTop3': photon_top3,
        'milestones': milestones,
    }

    OUTPUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'✅ Generated {OUTPUT_JSON.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

