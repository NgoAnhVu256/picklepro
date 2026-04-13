const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'front-end', 'app', 'admin');

// A function to recursively find all .tsx files
function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllTsxFiles(adminDir);

// Mapping of hardcoded dark classes to semantic Light/Dark classes
// Since Admin was built entirely natively for dark:
// bg-gray-900 -> bg-card / bg-background
// text-white -> text-foreground
// text-gray-400 -> text-muted-foreground
// text-gray-500 -> text-muted-foreground
// border-gray-800 -> border-border
// border-gray-700 -> border-border
// bg-gray-800 -> bg-muted

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // We apply careful regex to only replace whole words (classes)
  content = content.replace(/\bbg-gray-900\b/g, 'bg-card text-card-foreground shadow-sm');
  content = content.replace(/\bbg-gray-800\/50\b|bg-gray-800\b/g, 'bg-muted');
  content = content.replace(/\bborder-gray-800\/50\b|\bborder-gray-800\b|\bborder-gray-700\b/g, 'border-border');
  content = content.replace(/\btext-white\b/g, 'text-foreground');
  content = content.replace(/\btext-gray-400\b/g, 'text-muted-foreground');
  content = content.replace(/\btext-gray-500\b/g, 'text-muted-foreground');
  content = content.replace(/\btext-gray-300\b/g, 'text-secondary-foreground');
  content = content.replace(/\btext-gray-600\b/g, 'text-muted-foreground');
  
  // Font bold: "chữ font google sans bold"
  // Whenever we have a heading (h1, h2, h3, font-bold), make sure it has 'font-bold'
  // Actually, setting font-bold globally on headings is better, but Tailwind 'font-bold' already uses the font if configured in globals.css.
  
  // Instead of risking layout breakage, let's keep it simple.
  
  fs.writeFileSync(file, content, 'utf8');
}

console.log(`Updated ${files.length} files in Admin to support Light/Dark Mode seamlessly.`);
