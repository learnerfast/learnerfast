const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'public/templates');
const scriptTags = `<script src="/js/template-auth.js"></script>\n<script src="/js/template-init.js"></script>\n`;

function injectScripts(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      injectScripts(filePath);
    } else if (file === 'register.html' || file === 'signin.html') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes('template-auth.js')) {
        content = content.replace('</head>', `${scriptTags}</head>`);
        fs.writeFileSync(filePath, content);
        console.log(`✓ Injected scripts into ${filePath}`);
      } else {
        console.log(`- Skipped ${filePath} (already has scripts)`);
      }
    }
  });
}

console.log('Starting script injection...\n');
injectScripts(templatesDir);
console.log('\n✓ Script injection complete!');
