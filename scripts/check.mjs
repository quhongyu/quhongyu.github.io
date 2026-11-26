import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const papers = JSON.parse(await readFile(new URL('content/publications.json', root), 'utf8'));
assert.equal(papers.length, 19, 'Preserve the original 13 publications and six added preprints.');
const topics = ['MLLM', 'Video Understanding (eg. Video LLM, Video Agent)', 'Embodied AI', 'Efficient AI'];
const filterLabels = [...html.matchAll(/class="filter"[^>]*>([^<]+)<\/button>/g)].map(match => match[1]);
assert.deepEqual(filterLabels, ['All', ...topics], 'All and the four research filters must appear in the requested order.');
assert.equal(new Set(papers.map(paper => paper.title.toLowerCase())).size, papers.length, 'Duplicate publications.');
assert.equal(papers.filter(paper => paper.status === 'preprint').length, 6);
assert(html.includes(`Showing ${papers.length} of ${papers.length} publications`), 'Initial publication count is stale.');
assert.equal((html.match(/<article class="paper"/g) || []).length, papers.length);
assert(!html.includes('{{'), 'Unrendered template placeholder.');
assert(!/Binqian Xu<\/strong>|xubinq11|xbq_pic|user=8_28/.test(html), 'Template identity remains.');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs.');
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith('#')) { assert(ids.includes(value.slice(1)), `Missing anchor ${value}`); continue; }
  if (/^(https:|mailto:)/.test(value)) continue;
  await access(new URL(value, root));
}
for (const paper of papers) {
  assert(paper.authors.includes('Hongyu Qu'));
  assert(Array.isArray(paper.topics) && paper.topics.every(topic => topics.includes(topic)), 'Unknown research category.');
  if (paper.url) assert.equal(new URL(paper.url).protocol, 'https:');
  await access(new URL('Figures/' + paper.image, root));
}
assert.equal(await readFile(new URL('dist/index.html', root), 'utf8'), html, 'Deployment output differs.');
console.log(`Passed: ${papers.length} publications, All + four research filters, six preprints, local assets, section links, and deployment output.`);
