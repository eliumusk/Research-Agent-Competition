#!/usr/bin/env python3
"""
从 CSV 文件批量生成参赛作品 MDX 文件

使用方法:
    python scripts/generate-works-from-csv.py works.csv

CSV 文件格式要求:
    - 必须包含以下列: 项目名称, 一句话介绍, 项目详细介绍
    - 可选列: Bohrium App 链接, 团队成员和单位, 开发故事, 负责人姓名, 负责人单位
"""

import csv
import os
import sys
import re
from datetime import datetime
from pathlib import Path


def slugify(text):
    """将中文标题转换为 URL 友好的 slug"""
    # 移除特殊字符
    text = re.sub(r'[^\w\s-]', '', text)
    # 替换空格为连字符
    text = re.sub(r'[-\s]+', '-', text)
    return text.lower().strip('-')


def generate_mdx_from_csv(csv_file, output_dir='content/blog', cdn_base='https://cdn.example.com'):
    """
    从 CSV 文件生成 MDX 文件
    
    Args:
        csv_file: CSV 文件路径
        output_dir: 输出目录
        cdn_base: CDN 基础 URL
    """
    # 确保输出目录存在
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # 读取 CSV 文件
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"📊 找到 {len(rows)} 个作品")
    print(f"📁 输出目录: {output_dir}")
    print("-" * 50)
    
    for i, row in enumerate(rows, 1):
        try:
            # 生成文件名
            work_id = f"{i:03d}"
            title = row.get('项目名称', f'作品{work_id}')
            slug = slugify(title) or f'work-{work_id}'
            filename = f"{slug}.mdx"
            filepath = os.path.join(output_dir, filename)
            
            # 提取字段
            description = row.get('一句话介绍', '').strip()
            detail = row.get('项目详细介绍', '').strip()
            app_link = row.get('Bohrium App 链接', '').strip()
            team_members = row.get('团队成员和单位', '').strip()
            dev_story = row.get('开发故事', '').strip()
            team_leader = row.get('负责人姓名', '').strip()
            team_org = row.get('负责人单位', '').strip()
            
            # 生成 frontmatter
            frontmatter = f"""---
title: "{title}"
description: "{description or '参赛作品介绍'}"
image: /images/blog/work-{work_id}.png
date: "{datetime.now().strftime('%Y-%m-%d')}"
published: true
categories: [project]
author: contestant-{work_id}"""
            
            # 添加可选字段
            if app_link:
                frontmatter += f'\nappLink: "{app_link}"'
            
            frontmatter += f'\nvideoUrl: "{cdn_base}/videos/work-{work_id}.mp4"'
            frontmatter += f'\ntechReportUrl: "{cdn_base}/pdfs/work-{work_id}.pdf"'
            
            if team_leader:
                frontmatter += f'\nteamLeader: "{team_leader}"'
            
            if team_org:
                frontmatter += f'\nteamOrganization: "{team_org}"'
            
            frontmatter += '\n---\n'
            
            # 生成正文内容
            content = frontmatter + '\n'
            
            # 项目介绍
            if detail:
                content += f"""## 项目介绍

{detail}

"""
            
            # 演示视频
            content += f"""## 演示视频

<VideoPlayer 
  src="{cdn_base}/videos/work-{work_id}.mp4"
  poster="/images/blog/work-{work_id}.png"
/>

"""
            
            # 团队成员
            if team_members:
                content += f"""## 团队成员

{team_members}

"""
            
            # 开发故事
            if dev_story:
                content += f"""## 开发故事

{dev_story}

"""
            
            # 添加提示
            if app_link:
                content += """---

> 💡 **提示**：点击右侧"一键使用"按钮即可体验我们的应用！
"""
            
            # 写入文件
            with open(filepath, 'w', encoding='utf-8') as out:
                out.write(content)
            
            print(f"✅ [{i:03d}] {filename}")
            
        except Exception as e:
            print(f"❌ [{i:03d}] 生成失败: {e}")
            continue
    
    print("-" * 50)
    print(f"🎉 完成！共生成 {len(rows)} 个 MDX 文件")
    print(f"\n📝 下一步:")
    print(f"  1. 将封面图片放入 public/images/blog/ 目录")
    print(f"     命名格式: work-001.png, work-002.png, ...")
    print(f"  2. 上传视频和 PDF 到 Cloudflare R2")
    print(f"  3. 运行 'pnpm content' 重新生成内容")
    print(f"  4. 运行 'pnpm dev' 启动开发服务器")


def create_authors_from_csv(csv_file, output_dir='content/author'):
    """
    从 CSV 文件生成作者信息文件
    
    Args:
        csv_file: CSV 文件路径
        output_dir: 输出目录
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"\n👤 生成作者信息文件...")
    
    for i, row in enumerate(rows, 1):
        work_id = f"{i:03d}"
        team_leader = row.get('负责人姓名', f'参赛者{work_id}').strip()
        
        filename = f"contestant-{work_id}.mdx"
        filepath = os.path.join(output_dir, filename)
        
        content = f"""---
name: {team_leader}
avatar: /images/avatars/contestant-{work_id}.png
---
"""
        
        with open(filepath, 'w', encoding='utf-8') as out:
            out.write(content)
        
        print(f"✅ {filename}")
    
    print(f"🎉 完成！共生成 {len(rows)} 个作者文件")


def main():
    if len(sys.argv) < 2:
        print("❌ 错误: 请提供 CSV 文件路径")
        print(f"\n使用方法:")
        print(f"  python {sys.argv[0]} works.csv")
        print(f"\n可选参数:")
        print(f"  --cdn-base URL    设置 CDN 基础 URL (默认: https://cdn.example.com)")
        print(f"  --output-dir DIR  设置输出目录 (默认: content/blog)")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    # 解析可选参数
    cdn_base = 'https://cdn.example.com'
    output_dir = 'content/blog'
    
    for i, arg in enumerate(sys.argv[2:], 2):
        if arg == '--cdn-base' and i + 1 < len(sys.argv):
            cdn_base = sys.argv[i + 1]
        elif arg == '--output-dir' and i + 1 < len(sys.argv):
            output_dir = sys.argv[i + 1]
    
    if not os.path.exists(csv_file):
        print(f"❌ 错误: 文件不存在: {csv_file}")
        sys.exit(1)
    
    print("🚀 开始生成 MDX 文件...")
    print(f"📄 CSV 文件: {csv_file}")
    print(f"🌐 CDN 基础 URL: {cdn_base}")
    print()
    
    # 生成作品 MDX 文件
    generate_mdx_from_csv(csv_file, output_dir, cdn_base)
    
    # 生成作者信息文件
    create_authors_from_csv(csv_file)
    
    print("\n✨ 全部完成！")


if __name__ == '__main__':
    main()

