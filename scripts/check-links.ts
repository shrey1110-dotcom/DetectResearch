import { ensureAbsoluteUrl } from '../src/lib/url';

const testUrls = [
  'csulb.edu/research',
  'pacific.edu/engineering',
  'https://news.mit.edu',
  '//stanford.edu/lab'
];

console.log('Testing URL sanitization:');
for (const u of testUrls) {
  console.log(`Original: ${u} => Sanitized: ${ensureAbsoluteUrl(u)}`);
}
