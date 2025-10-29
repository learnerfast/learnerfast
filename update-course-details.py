#!/usr/bin/env python3
import re
import os

# Academic Pro main content (between header and footer)
academic_main = '''<main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4">
<div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
<div class="lg:col-span-2">
<div class="flex flex-col gap-8">
<div>
<div class="mb-4">
<a href="courses.html" class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
<span class="material-symbols-outlined text-lg">arrow_back</span>
Back to Courses
</a>
</div>
<div class="rounded-xl overflow-hidden mb-6">
<img alt="A smiling instructor pointing at code on a computer screen." class="w-full h-96 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN0z4MnbkLjN_A78LdMQvX06a514I5OZ9cGh6qaOw_iRVL8Uzsre8hFUwoNqtTX6KsRWfoGjvvnEW8ZSOltIZ0YaqwJi_RabF7kXGOoe4eWAaVl_OOYqEvNUPKPoje1VVr0GZXZfmsPZFJzeGsjYi2DZEAHSPpTkRH8VaUnJAdXlqWUwH8YW2fhIEyDpRyTS8hXJYuGytZRqFee5mCT_tqldZtfXxCrBxNHmsafJ3N0XawZvcl23Q-HmL7MVs_lBWwtbePBbSPNcdU"/>
</div>
<h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">Complete Web Development Bootcamp</h2>
<p class="mt-3 text-base text-gray-600 dark:text-gray-300">Master front-end and back-end development with this comprehensive course. Build real-world projects and become a job-ready web developer.</p>
</div>
<div class="border-b border-gray-200 dark:border-gray-700">
<nav aria-label="Tabs" class="-mb-px flex space-x-8">
<a class="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" href="#">Overview</a>
</nav>
</div>
<div class="space-y-4">
<section>
<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">What you'll learn</h3>
<div class="grid grid-cols-1 gap-3">
<div class="flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-gray-800/50">
<span class="material-symbols-outlined text-primary text-xl">code</span>
<p class="text-sm text-gray-800 dark:text-gray-200">Build 10+ real-world projects</p>
</div>
<div class="flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-gray-800/50">
<span class="material-symbols-outlined text-primary text-xl">laptop_chromebook</span>
<p class="text-sm text-gray-800 dark:text-gray-200">Master front-end and back-end technologies</p>
</div>
<div class="flex items-start gap-3 p-3 rounded-lg bg-background-light dark:bg-gray-800/50">
<span class="material-symbols-outlined text-primary text-xl">database</span>
<p class="text-sm text-gray-800 dark:text-gray-200">Deploy your applications to the cloud</p>
</div>
</div>
</section>
<section>
<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Instructor</h3>
<div class="flex items-center gap-6">
<div class="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAzQP4vL_UPZC4ZUWpoIW6EDnLHJ0eEifNAptFmEcILF7KDZzbHGV2Cd_WtFtDgugrF63lpQAe464mc1s0ngMLEDomI7ELr9F6mCQrLb7yMqHbioUfblJ6bnSTWi-XcB40HykkUR3moNfTOk8OoW496BST77qh8Bc_kOXL4pL03tTCWIODSwzXNBd3fmdDdx_h82Lhc4l0f6J1oHLeDtLu7LYtZ0Ips0Gfjd64iHJLPBq3jhCei5m0MbQgKfHlmkOzBqJ8RNR21pjd4");'></div>
<div>
<h4 class="text-lg font-bold text-gray-900 dark:text-white">Ethan Carter</h4>
<p class="text-gray-600 dark:text-gray-300">Full-Stack Developer &amp; Instructor</p>
</div>
</div>
<p class="mt-4 text-gray-600 dark:text-gray-400">Ethan Carter is a seasoned full-stack developer with over 10 years of experience in the industry. He has worked with numerous startups and tech companies, building scalable and robust web applications.</p>
</section>
<section>
<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Course Syllabus</h3>
<div class="space-y-3">
<details class="group rounded-lg border border-gray-200 dark:border-gray-700">
<summary class="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50">
<span>Module 1: Introduction to Data Science</span>
<span class="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
Overview of the data science workflow, key concepts, and real-world applications.
</div>
</details>
<details class="group rounded-lg border border-gray-200 dark:border-gray-700">
<summary class="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50">
<span>Module 2: Data Analysis with Python</span>
<span class="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
Learn Python fundamentals and data manipulation using Pandas and NumPy libraries.
</div>
</details>
<details class="group rounded-lg border border-gray-200 dark:border-gray-700">
<summary class="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50">
<span>Module 3: Data Visualization Techniques</span>
<span class="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
Create compelling visualizations using Matplotlib and Seaborn.
</div>
</details>
<details class="group rounded-lg border border-gray-200 dark:border-gray-700">
<summary class="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50">
<span>Module 4: Machine Learning Fundamentals</span>
<span class="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
Introduction to machine learning algorithms, model training, and evaluation.
</div>
</details>
<details class="group rounded-lg border border-gray-200 dark:border-gray-700">
<summary class="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50">
<span>Module 5: Capstone Project</span>
<span class="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
</summary>
<div class="border-t border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
Apply all learned concepts to complete a comprehensive data science project.
</div>
</details>
</div>
</section>
</div>
</div>
</div>
<aside class="lg:col-span-1">
<div class="sticky top-4">
<div class="rounded-xl bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
<div class="p-6">
<h3 class="text-2xl font-bold text-gray-900 dark:text-white">$84.99</h3>
<p class="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">$129.99</p>
<button class="w-full mt-6 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-200">
Enroll Now
</button>
<button class="w-full mt-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
Add to Cart
</button>
<p class="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">30-Day Money-Back Guarantee</p>
</div>
<div class="border-t border-gray-200 dark:border-gray-700 p-6">
<h4 class="font-semibold text-gray-900 dark:text-white mb-3">This course includes:</h4>
<ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">ondemand_video</span>20.5 hours on-demand video</li>
<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">article</span>12 articles</li>
<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">download_for_offline</span>Downloadable resources</li>
<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">all_inclusive</span>Full lifetime access</li>
<li class="flex items-center gap-3"><span class="material-symbols-outlined text-base text-primary">smartphone</span>Access on mobile and TV</li>
</ul>
</div>
</div>
</div>
</aside>
</div>
</main>'''

templates = ['academic-pro', 'creative-pro', 'finance-banking', 'finance-crypto', 'finance-investment', 'fitness-gym', 'fitness-personal', 'fitness-yoga', 'modern-minimal']

for template in templates:
    file_path = f'public/templates/{template}/course-detail.html'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract header (from start to </header>)
    header_match = re.search(r'(.*?</header>)', content, re.DOTALL)
    header = header_match.group(1) if header_match else ''
    
    # Extract footer (from <footer to end)
    footer_match = re.search(r'(<footer.*)', content, re.DOTALL)
    footer = footer_match.group(1) if footer_match else ''
    
    # Add Material Icons if not present in head
    if 'Material+Symbols+Outlined' not in header:
        header = header.replace('</head>', '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>\n</head>')
    
    # Combine header + academic main + footer
    new_content = header + '\n' + academic_main + '\n' + footer
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'Updated {template}')

print('All templates updated!')
