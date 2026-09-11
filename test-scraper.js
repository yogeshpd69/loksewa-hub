import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('test_gorkha.html', 'utf8');
const $ = cheerio.load(html);

const title = $('h1').first().text().trim() || $('title').text().replace('- Gorkhapatra', '').trim();
let content = $('.item-content p').map((i, el) => $(el).text().trim()).get().join('\n\n');
if (!content) {
  content = $('article p').map((i, el) => $(el).text().trim()).get().join('\n\n');
}

console.log("TITLE:", title);
console.log("CONTENT LENGTH:", content.length);
console.log("PREVIEW:", content.substring(0, 100));
