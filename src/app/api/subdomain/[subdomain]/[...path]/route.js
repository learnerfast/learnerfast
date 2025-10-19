import { supabase } from '../../../../../lib/supabase';
import { templateService } from '../../../../../components/builder/templateService';

function sanitizeHTML(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?\.builder-[^}]*}[\s\S]*?<\/style>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?outline:[^;]*;[\s\S]*?<\/style>/gi, '')
    .replace(/\s*class="[^"]*builder-[^"]*"/gi, '')
    .replace(/\s*data-element-type="[^"]*"/gi, '')
    .replace(/\s*data-builder-element="[^"]*"/gi, '')
    .replace(/\s*data-dragging="[^"]*"/gi, '')
    .replace(/\s*draggable="[^"]*"/gi, '');
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
  const pageName = path ? path.join('/') : 'index';
  let pageKey = pageName === 'index' ? 'home' : pageName;
  
  if (pageKey === 'course-detail' || pageKey === 'course_detail') {
    pageKey = 'course-detail';
  }
  
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
      .single();
    
    let html = null;
    
    if (savedData?.page_contents?.[pageKey]) {
      html = savedData.page_contents[pageKey];
    } else {
      const templateId = siteData?.template_id || savedData?.template_id || 'modern-minimal';
      const { template, content } = await templateService.loadTemplate(templateId, pageKey);
      
      html = content
        .replace(/src="(?!https?:\/\/)/g, `src="${template.path}`)
        .replace(/href="(?!https?:\/\/|#|\/)([^"]+\.css)"/g, `href="${template.path}$1"`)
        .replace(/url\("(?!https?:\/\/)/g, `url("${template.path}`)
        .replace(/url\('(?!https?:\/\/)/g, `url('${template.path}`);
    }
    
    html = sanitizeHTML(html);
    html = rewriteLinks(html, subdomain);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Subdomain preview error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
