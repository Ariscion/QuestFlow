const fs = require('fs');

const xml = fs.readFileSync('temp_vaicm/word/document.xml', 'utf8');

// Strip all XML tags
const text = xml.replace(/<[^>]+>/g, '');

fs.writeFileSync('vaicm_exam_clean.txt', text, 'utf8');
console.log('Done');
