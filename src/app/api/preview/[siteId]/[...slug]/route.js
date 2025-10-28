import { supabase } from '../../../../../lib/supabase';
import fs from 'fs';
import path from 'path';

function sanitizeHTML(html) {
  return html
    // Remove builder CSS styles from head
    .replace(/<style[^>]*>[\s\S]*?\.builder-[^}]*}[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?outline:[^;]*;[\s\S]*?<\/style>/gi, '')
    // Remove builder classes and attributes
    .replace(/\s*class="[^"]*builder-[^"]*"/gi, '')
    .replace(/\s*data-element-type="[^"]*"/gi, '')
    .replace(/\s*data-builder-element="[^"]*"/gi, '')
    .replace(/\s*data-dragging="[^"]*"/gi, '')
    .replace(/\s*draggable="[^"]*"/gi, '')
    // Remove inline outline styles
    .replace(/\s*style="[^"]*outline:[^;"]*;?[^"]*"/gi, (match) => {
      const cleaned = match.replace(/outline:[^;"]*;?/gi, '').replace(/style=""/gi, '');
      return cleaned.includes('style=""') ? '' : cleaned;
    });
}

function rewriteLinks(html, siteId) {
  return html
    .replace(/href="([^"]*\.html)"/gi, (match, url) => {
      if (url.startsWith('http') || url.startsWith('mailto:')) {
        return match;
      }
      const pageName = url.replace('.html', '').replace(/^\.\//, '');
      return `href="/api/preview/${siteId}/${pageName}"`;
    })
    .replace(/href="#([^"]+)"/gi, (match, hash) => {
      const pageNames = ['home', 'about', 'courses', 'contact', 'signin', 'register', 'course-detail', 'course_detail', 'coursedetail'];
      if (pageNames.includes(hash)) {
        const pageName = hash.replace('_', '-');
        return `href="/api/preview/${siteId}/${pageName}"`;
      }
      return `href="#${hash}"`;
    })
    .replace(/href="#"/gi, `href="/api/preview/${siteId}/home"`);
}

export async function GET(request, { params }) {
  const { siteId, slug } = await params;
  const pageName = slug ? slug.join('/') : 'home';
  let pageKey = pageName === 'index' ? 'home' : pageName;
  
  // Map course-detail variations to the correct template page
  if (pageKey === 'course-detail' || pageKey === 'course_detail' || pageKey === 'coursedetail') {
    pageKey = 'course-detail';
  }
  
  try {
    // Get site data first to get template_id
    const { data: siteData, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();
    
    
    // Get saved content from database
    const { data: savedData } = await supabase
      .from('website_builder_saves')
      .select('page_contents, template_id')
      .eq('site_id', siteId)
      .single();
    
    // Use site's template_id as the primary source
    const templateId = siteData?.template_id || 'modern-minimal';
    
    let html = null;
    
    // Prioritize saved content (shows editor changes)
    if (savedData?.page_contents?.[pageKey]) {
      html = savedData.page_contents[pageKey];
    } else {
      // Load original template from filesystem
      const pageFiles = {
        'home': 'index.html',
        'about': 'about.html',
        'courses': 'courses.html',
        'contact': 'contact.html',
        'signin': 'signin.html',
        'register': 'register.html',
        'course-detail': 'course-detail.html',
        'checkout': 'checkout.html',
        'payment': 'payment.html'
      };
      
      const fileName = pageFiles[pageKey] || 'index.html';
      const filePath = path.join(process.cwd(), 'public', 'templates', templateId, fileName);
      
      try {
        html = fs.readFileSync(filePath, 'utf8');
      } catch (err) {
        const fallbackPath = path.join(process.cwd(), 'public', 'templates', templateId, 'index.html');
        html = fs.readFileSync(fallbackPath, 'utf8');
      }
      
      const templatePath = `/templates/${templateId}/`;
      html = html
        .replace(/src="(?!https?:\/\/)/g, `src="${templatePath}`)
        .replace(/href="(?!https?:\/\/|#|\/api\/preview)([^"]+\.css)"/g, `href="${templatePath}$1"`)
        .replace(/url\("(?!https?:\/\/)/g, `url("${templatePath}`)
        .replace(/url\('(?!https?:\/\/)/g, `url('${templatePath}`);
      
      html = html
        .replace(/href="index\.html"/g, `href="/api/preview/${siteId}/home"`)
        .replace(/href="about\.html"/g, `href="/api/preview/${siteId}/about"`)
        .replace(/href="courses\.html"/g, `href="/api/preview/${siteId}/courses"`)
        .replace(/href="contact\.html"/g, `href="/api/preview/${siteId}/contact"`)
        .replace(/href="course-detail\.html"/g, `href="/api/preview/${siteId}/course-detail"`)
        .replace(/href="signin\.html"/g, `href="/api/preview/${siteId}/signin"`)
        .replace(/href="register\.html"/g, `href="/api/preview/${siteId}/register"`)
        .replace(/href="checkout\.html"/g, `href="/api/preview/${siteId}/checkout"`)
        .replace(/href="payment\.html"/g, `href="/api/preview/${siteId}/payment"`);
      
      html = sanitizeHTML(html);
    }
    
    html = rewriteLinks(html, siteId);
    
    // Fix navigation buttons that don't have proper hrefs
    html = html.replace(
      /<button[^>]*>\s*<span[^>]*>Sign In<\/span>\s*<\/button>/gi,
      `<a href="/api/preview/${siteId}/signin" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-transparent border border-primary text-primary text-sm font-bold hover:bg-primary/10 transition-all duration-300"><span class="truncate">Sign In</span></a>`
    );
    
    html = html.replace(
      /<button[^>]*>\s*<span[^>]*>Sign Up<\/span>\s*<\/button>/gi,
      `<a href="/api/preview/${siteId}/register" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all duration-300"><span class="truncate">Sign Up</span></a>`
    );
    
    // Fix course action buttons to link to course detail page
    html = html.replace(
      /<(button|a)[^>]*>\s*(?:<[^>]*>)?\s*(Enroll Now|Learn More|View Course|Get Started)\s*(?:<\/[^>]*>)?\s*<\/(button|a)>/gi,
      `<a href="/api/preview/${siteId}/course-detail" class="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">$2</a>`
    );
    
    // Add auth redirect script
    const authScript = `<script>
      // Override template-auth.js redirect URLs for preview
      window.TEMPLATE_AUTH_REDIRECT = window.location.pathname.replace(/\/(signin|register).*/, '/home');
    </script>`;
    html = html.replace('</head>', authScript + '</head>');
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    return new Response(`Preview not available: ${error.message}`, { status: 500 });
  }
}