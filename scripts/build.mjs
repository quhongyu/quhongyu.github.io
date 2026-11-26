import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'content/publications.json'), 'utf8'));
const profile = JSON.parse(await readFile(path.join(root, 'content/profile.json'), 'utf8'));
const scholar = JSON.parse(await readFile(path.join(root, 'content/scholar.json'), 'utf8'));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const external = 'target="_blank" rel="noopener noreferrer"';
const newsDate = date => `${['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'][Number(date.slice(5)) - 1]} ${date.slice(0, 4)}`;
const newsList = items => `<ul class="news-list">${items.map(item => `<li><time datetime="${item.date}">[${newsDate(item.date)}]</time><span>${item.text}</span></li>`).join('')}</ul>`;
const news = `<div class="news-scroll" tabindex="0" role="region" aria-label="News archive, scroll to read earlier updates">${newsList(profile.news)}</div>`;
const topics = ['All', 'MLLM', 'Video Understanding (eg. Video LLM, Video Agent)', 'Embodied AI', 'Efficient AI'];
const filters = topics.map(topic => `<button class="filter" type="button" data-topic="${escape(topic)}" aria-pressed="${topic === 'All'}">${escape(topic)}</button>`).join('');
const authorPriority = paper => paper.authors.includes('<b>Hongyu Qu</b><sup>†</sup>') ? 1 : paper.authors.startsWith('<b>Hongyu Qu</b>') ? 0 : 2;
const publicationPriority = paper => authorPriority(paper) === 2 ? 3 : paper.status === 'preprint' ? 2 : authorPriority(paper);
const papers = [...data].sort((a, b) => publicationPriority(a) - publicationPriority(b) || b.year - a.year).map(paper => {
  const venue = paper.venue.match(/<b>(.*?)<\/b>/)[1];
  const title = paper.url ? `<a href="${escape(paper.url)}" ${external}>${escape(paper.title)}</a>` : escape(paper.title);
  const links = paper.url ? `<a href="${escape(paper.url)}" ${external} aria-label="Paper: ${escape(paper.title)}">[Paper]</a>` : '<span class="paper-pending">Paper link to be updated</span>';
  const authors = paper.projectRole === 'Project Leader' ? paper.authors.replace('<b>Hongyu Qu</b>', '<b>Hongyu Qu</b><sup title="Project leader">‡</sup>') : paper.authors;
  return `<article class="paper" data-topics="${escape(JSON.stringify(paper.topics))}"><figure class="paper-image"><span class="badge${paper.status === 'preprint' ? ' badge-preprint' : ''}">${escape(venue)} ${paper.year}</span><img src="Figures/${escape(paper.image)}" alt="Overview of ${escape(paper.title)}" width="460" height="286" loading="lazy"></figure><div class="paper-text"><h3>${title}</h3><p class="authors">${authors}</p><p class="venue">${paper.venue}</p><div class="paper-links">${links}${paper.code ? `<a href="${escape(paper.code)}" ${external}>[Code]</a>` : ''}</div></div></article>`;
}).join('\n');
const services = `<div class="services-grid">${Object.entries(profile.services).map(([heading, entries]) => `<div><h3>${escape(heading)}</h3><ul>${entries.map(entry => `<li>${escape(entry)}</li>`).join('')}</ul></div>`).join('')}</div>`;
const template = await readFile(path.join(root, 'index.template.html'), 'utf8');
const accepted = data.filter(paper => paper.status !== 'preprint');
const firstAuthor = accepted.filter(paper => authorPriority(paper) === 0);
const coFirstAuthor = accepted.filter(paper => authorPriority(paper) === 1);
const venueCounts = entries => {
  const counts = new Map();
  for (const paper of entries) {
    const venue = paper.venue.match(/<b>(.*?)<\/b>/)[1];
    counts.set(venue, (counts.get(venue) || 0) + 1);
  }
  return [...counts].map(([venue, count]) => `${count} ${escape(venue)}`).join(', ');
};
const stats = `<a href="${escape(scholar.url)}" ${external}>Google Scholar citations: ${scholar.citations}</a> (as of <time datetime="${escape(scholar.checkedAt)}">${escape(scholar.checkedAt)}</time>) · Accepted: ${firstAuthor.length} first-author (${venueCounts(firstAuthor)}) / ${coFirstAuthor.length} co-first-author (${venueCounts(coFirstAuthor)}) (excluding preprints).`;
const html = template.replace('{{NEWS}}', news).replace('{{FILTERS}}', filters).replace('{{PUBLICATIONS}}', papers).replace('{{SERVICES}}', services).replace('{{RESEARCH_STATS}}', stats).replaceAll('{{PUBLICATION_COUNT}}', data.length);
await writeFile(path.join(root, 'index.html'), html);
await mkdir(path.join(root, 'dist'), { recursive: true });
await writeFile(path.join(root, 'dist/index.html'), html);
for (const dir of ['assets', 'Figures']) await cp(path.join(root, dir), path.join(root, 'dist', dir), { recursive: true });
await cp(path.join(root, '.nojekyll'), path.join(root, 'dist/.nojekyll'));
console.log(`Built ${data.length} publications to index.html and dist/.`);
