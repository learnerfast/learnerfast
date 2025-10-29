#!/usr/bin/env python3
import os
import re
from pathlib import Path

templates_dir = Path('public/templates')

for template_file in templates_dir.glob('*/course-detail.html'):
    print(f'Updating {template_file}...')
    
    with open(template_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add course-description class to description paragraph
    content = re.sub(
        r'(<p class="[^"]*"[^>]*>Master front-end)',
        r'<p class="course-description mt-3 text-base text-gray-600 dark:text-gray-300">Master front-end',
        content
    )
    
    # Add what-you-learn class to the grid/list
    content = re.sub(
        r'(<div class="grid grid-cols-1 gap-3">)',
        r'<ul class="what-you-learn grid grid-cols-1 gap-3">',
        content
    )
    content = re.sub(
        r'(</div>\s*</section>\s*<section>\s*<h3[^>]*>Instructor)',
        r'</ul>\n</section>\n<section>\n<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Instructor',
        content
    )
    
    # Change divs to li in what you'll learn section
    content = re.sub(
        r'<div class="flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-gray-800/50">',
        r'<li class="flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-gray-800/50">',
        content
    )
    content = re.sub(
        r'<p class="text-sm text-gray-800 dark:text-gray-200">([^<]+)</p>\s*</div>',
        r'<span class="text-sm text-gray-800 dark:text-gray-200">\1</span></li>',
        content
    )
    
    # Add instructor classes
    content = re.sub(
        r'(<h4 class="[^"]*">Ethan Carter</h4>)',
        r'<h4 class="instructor-name text-lg font-bold text-gray-900 dark:text-white">Ethan Carter</h4>',
        content
    )
    content = re.sub(
        r'(<p class="[^"]*">Full-Stack Developer)',
        r'<p class="instructor-title text-gray-600 dark:text-gray-300">Full-Stack Developer',
        content
    )
    content = re.sub(
        r'(<p class="mt-4[^"]*">Ethan Carter is a seasoned)',
        r'<p class="instructor-bio mt-4 text-gray-600 dark:text-gray-400">Ethan Carter is a seasoned',
        content
    )
    
    # Add course-syllabus class
    content = re.sub(
        r'(<div class="space-y-3">\s*<details)',
        r'<div class="course-syllabus space-y-3">\n<details',
        content
    )
    
    # Add course-includes class
    content = re.sub(
        r'(<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">\s*<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">ondemand_video)',
        r'<ul class="course-includes space-y-2 text-sm text-gray-600 dark:text-gray-300">\n<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">ondemand_video</span><span>',
        content
    )
    
    # Wrap text in spans for course includes
    content = re.sub(
        r'(ondemand_video</span>)20\.5 hours',
        r'\1<span>20.5 hours',
        content
    )
    content = re.sub(
        r'(article</span>)12 articles',
        r'\1<span>12 articles',
        content
    )
    content = re.sub(
        r'(download_for_offline</span>)Downloadable',
        r'\1<span>Downloadable',
        content
    )
    content = re.sub(
        r'(all_inclusive</span>)Full lifetime',
        r'\1<span>Full lifetime',
        content
    )
    content = re.sub(
        r'(smartphone</span>)Access on',
        r'\1<span>Access on',
        content
    )
    content = re.sub(
        r'(video|articles|resources|access|TV)(</li>)',
        r'\1</span>\2',
        content
    )
    
    # Add course-price class
    content = re.sub(
        r'(<h3 class="[^"]*">)\$84\.99',
        r'<h3 class="course-price text-2xl font-bold text-gray-900 dark:text-white">$84.99',
        content
    )
    
    with open(template_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'✓ Updated {template_file}')

print('\nAll templates updated successfully!')
