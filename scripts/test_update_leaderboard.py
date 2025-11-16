#!/usr/bin/env python3
import os
import sys
import unittest
import pandas as pd
from pathlib import Path

# Ensure repo root is on sys.path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Import the module under test via file path to avoid package name conflicts
import importlib.util
UL_PATH = ROOT / 'scripts' / 'update-leaderboard.py'
spec = importlib.util.spec_from_file_location('update_leaderboard', UL_PATH)
ul = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ul)

# Re-export used symbols
to_int = ul.to_int
build_photon_top3 = ul.build_photon_top3
build_subscription_growth_top3 = ul.build_subscription_growth_top3
build_milestones = ul.build_milestones
PREV_SUBS_PATH = ul.PREV_SUBS_PATH

class TestUpdateLeaderboard(unittest.TestCase):
    def setUp(self):
        # Ensure test isolation for prev_subscriptions.json
        self._backup = None
        if PREV_SUBS_PATH.exists():
            self._backup = PREV_SUBS_PATH.read_bytes()
            PREV_SUBS_PATH.unlink()
        else:
            PREV_SUBS_PATH.parent.mkdir(parents=True, exist_ok=True)

    def tearDown(self):
        # Restore snapshot file if existed
        if self._backup is not None:
            PREV_SUBS_PATH.write_bytes(self._backup)
        elif PREV_SUBS_PATH.exists():
            PREV_SUBS_PATH.unlink()

    def test_to_int(self):
        self.assertEqual(to_int('4,313'), 4313)
        self.assertEqual(to_int(' 999 '), 999)
        self.assertEqual(to_int('abc'), 0)
        self.assertEqual(to_int(None), 0)

    def test_build_photon_top3(self):
        df_week = pd.DataFrame({
            'app_key': ['a', 'b', 'c', 'd'],
            '单笔光子消耗': [100, 300, 200, 50],
            '计费时间(week)': ['2025/11/03～2025/11/09']*4,
        })
        df_cum = pd.DataFrame({
            '队伍': ['A', 'B', 'C', 'D'],
            'app_key': ['a', 'b', 'c', 'd'],
            '订阅数': [10, 20, 30, 40],
            '光子消耗量': [100, 200, 300, 400],
        })
        top3 = build_photon_top3(df_week, df_cum)
        ranks = [t['appKey'] for t in top3]
        self.assertEqual(ranks, ['b', 'c', 'a'])
        self.assertEqual([t['reward'] for t in top3], [500, 300, 200])

    def test_build_subscription_growth_top3_first_run(self):
        df_cum = pd.DataFrame({
            '队伍': ['A', 'B', 'C'],
            'app_key': ['a', 'b', 'c'],
            '订阅数': [10, 20, 30],
            '光子消耗量': [100, 200, 300],
        })
        top3, available = build_subscription_growth_top3(df_cum)
        self.assertFalse(available)
        self.assertEqual(top3, [])
        # Snapshot should be created
        self.assertTrue(PREV_SUBS_PATH.exists())

    def test_build_subscription_growth_top3_second_run(self):
        # First run initializes snapshot
        df_cum1 = pd.DataFrame({
            '队伍': ['A', 'B', 'C'],
            'app_key': ['a', 'b', 'c'],
            '订阅数': [10, 20, 30],
            '光子消耗量': [100, 200, 300],
        })
        _top, _avail = build_subscription_growth_top3(df_cum1)

        # Second run with growth
        df_cum2 = pd.DataFrame({
            '队伍': ['A', 'B', 'C'],
            'app_key': ['a', 'b', 'c'],
            '订阅数': [15, 22, 50],  # a:+5, b:+2, c:+20
            '光子消耗量': [100, 200, 300],
        })
        top3, available = build_subscription_growth_top3(df_cum2)
        self.assertTrue(available)
        self.assertEqual([t['appKey'] for t in top3], ['c', 'a', 'b'])
        self.assertEqual([t['growth'] for t in top3], [20, 5, 2])

    def test_build_milestones(self):
        df_cum = pd.DataFrame({
            '队伍': ['A', 'B', 'C'],
            'app_key': ['a', 'b', 'c'],
            '订阅数': [500, 12, 600],
            '光子消耗量': ['10,000', 9000, 11000],
        })
        m = build_milestones(df_cum)
        subs = sorted([x['appKey'] for x in m['subscription500']])
        pho = sorted([x['appKey'] for x in m['photon10000']])
        self.assertEqual(subs, ['a', 'c'])
        self.assertEqual(pho, ['a', 'c'])

if __name__ == '__main__':
    unittest.main(verbosity=2)

