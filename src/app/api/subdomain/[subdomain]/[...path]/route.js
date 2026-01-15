import { supabase } from '../../../../../lib/supabase';
import { templateService } from '../../../../../components/builder/templateService';

function sanitizeHTML(html) {
  let cleaned = html
    .replace(/<style[^>]*>[\s\S]*?\.builder-[^}]*}[\s\S]*?<\/style>/gi, '')
    .replace(/\s*class="([^"]*)"/gi, (match, classes) => {
      const filtered = classes.split(' ').filter(c => !c.includes('builder')).join(' ').trim();
      return filtered ? ` class="${filtered}"` : '';
    })
    .replace(/\s*data-element-type="[^"]*"/gi, '')
    .replace(/\s*data-builder-element="[^"]*"/gi, '')
    .replace(/\s*data-dragging="[^"]*"/gi, '')
    .replace(/\s*draggable="true"/gi, '');
  
  cleaned = cleaned.replace(/style="([^"]*)"/gi, (match, styles) => {
    const filtered = styles.split(';')
      .filter(s => s.trim() && !s.includes('outline') && !s.includes('cursor'))
      .join(';').trim();
    return filtered ? `style="${filtered}"` : '';
  });
  
  cleaned = cleaned.replace(/<\/head>/i, `<style>*{outline:none!important;cursor:default!important}</style></head>`);
  
  return cleaned;
}

function rewriteLinks(html, subdomain) {
  return html
    .replace(/href="([^"]*\.html)"/gi, (match, url) => {
      if (url.startsWith('http') || url.startsWith('mailto:')) return match;
      const pageName = url.replace('.html', '').replace(/^\.\//, '');
      return `href="/${pageName}"`;
    })
    .replace(/href="#([^"]+)"/gi, (match, hash) => {
      const pageNames = ['home', 'about', 'courses', 'contact', 'signin', 'register', 'course-detail'];
      if (pageNames.includes(hash)) return `href="/${hash}"`;
      return match;
    })
    .replace(/href="#"/gi, `href="/"`);
}

export async function GET(request, { params }) {
  const { subdomain, path } = await params;
  const pathArray = Array.isArray(path) ? path : [path];
  const pageName = pathArray.length > 0 ? pathArray.join('/') : 'index';
  
  // Handle JS file requests - check if first segment is 'js'
  if (pathArray[0] === 'js' && pathArray.length > 1) {
    const jsFileName = pathArray.slice(1).join('/');
    const fs = await import('fs');
    const pathModule = await import('path');
    const filePath = pathModule.join(process.cwd(), 'public', 'js', jsFileName);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return new Response(fileContent, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      return new Response(`JS file not found: ${jsFileName}`, { status: 404 });
    }
  }
  
  let pageKey = pageName === 'index' ? 'home' : pageName;
  
  // Handle course-detail with slug (e.g., course-detail/demo)
  if (pathArray[0] === 'course-detail' && pathArray.length > 1) {
    pageKey = 'course-detail';
  }
  
  // Normalize page names
  const pageMap = {
    'course-detail': 'course detail',
    'course_detail': 'course detail',
    'sign-in': 'signin',
    'sign-up': 'register',
    'course detail': 'course detail'
  };
  
  pageKey = pageMap[pageKey] || pageKey;
  
  try {
    const { data: siteData } = await supabase
      .from('sites')
      .select('*')
      .eq('url', subdomain)
      .single();
    
    if (!siteData) {
      return new Response('Site not found', { status: 404 });
    }
    
    const { data: savedData } = await supabase
      .from('website_builder_saves')
      .select('page_contents, template_id')
      .eq('site_id', siteData.id)
      .maybeSingle();
    
    const templateId = siteData.template_id || 'modern-minimal';
    let html = null;
    let debugInfo = { subdomain, siteId: siteData.id, templateId, pageKey, usedSaved: false };
    
    // Only use saved content if it matches the current template
    if (savedData?.page_contents && savedData.template_id === templateId) {
      // Try exact match first
      if (savedData.page_contents[pageKey]) {
        html = savedData.page_contents[pageKey];
      } else {
        // Try case-insensitive match
        const keys = Object.keys(savedData.page_contents);
        const matchedKey = keys.find(k => k.toLowerCase() === pageKey.toLowerCase());
        if (matchedKey) {
          html = savedData.page_contents[matchedKey];
        }
      }
    }
    
    if (!html) {
      const { template, content } = await templateService.loadTemplate(templateId, pageKey);
      debugInfo.templatePath = template.path;
      
      html = content
        .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
        .replace(/href="(?!https?:\/\/|#|\/)([^"]+\.css)"/g, `href="${template.path}$1"`)
        .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
        .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`);
    } else {
      debugInfo.usedSaved = true;
      debugInfo.savedTemplateId = savedData?.template_id;
    }
    
    html = sanitizeHTML(html);
    html = rewriteLinks(html, subdomain);
    
    // Debug info removed for production
    
    // Replace or add title tag
    if (html.match(/<title>[^<]*<\/title>/i)) {
      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${siteData.name}</title>`);
    } else {
      html = html.replace(/<\/head>/i, `<title>${siteData.name}</title></head>`);
    }
    
    // Add favicon
    html = html.replace(/<link[^>]*rel="icon"[^>]*>/gi, '');
    html = html.replace(/<\/head>/i, '<link rel="icon" type="image/png" href="https://learnerfast.com/favicon.png"/></head>');
    
    // Inject auth script
    html = html.replace('</body>', '<script src="/js/template-auth.js"></script></body>');
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://checkout.razorpay.com blob:; worker-src 'self' blob:; connect-src 'self' https://*.supabase.co https://www.learnerfast.com https://learnerfast.com https://cdn.jsdelivr.net https://api.razorpay.com https://lumberjack-cx.razorpay.com wss://*.supabase.co; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
      }
    });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}
