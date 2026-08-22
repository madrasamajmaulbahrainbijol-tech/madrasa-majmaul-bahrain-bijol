const fs = require('fs');
const path = require('path');

const root = path.resolve('app');
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.mjs', '.md']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name))) {
      const before = fs.readFileSync(full, 'utf8');
      const after = before
        .replaceAll('/madrasa-logo.jpg', '/mmbb-logo.svg')
        .replaceAll('madrasa-logo.jpg', 'mmbb-logo.svg');
      if (after !== before) fs.writeFileSync(full, after, 'utf8');
    }
  }
}

walk(root);
console.log('Final Madrasa logo references applied.');
