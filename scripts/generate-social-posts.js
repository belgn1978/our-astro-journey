const fs = require('fs');
const path = require('path');
const { siteUpdates } = require('../assets/js/site-updates.js');

const SITE_URL = 'https://www.ourastrojourney.co.uk';
const outputPath = path.join(__dirname, '..', 'social-posts.md');

function absoluteUrl(relativeUrl) {
  const clean = String(relativeUrl || '').replace(/^\.\//, '');
  return `${SITE_URL}/${clean}`;
}

function latestUpdates() {
  return [...siteUpdates].sort((a, b) => {
    if (a.date === b.date) {
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    }
    return b.date.localeCompare(a.date);
  });
}

function buildXPost(update) {
  return `${update.socialTitle}\n\n${update.socialSummary}\n\nRead more: ${absoluteUrl(update.url)}\n\n#Astrophotography #SolarEclipse #Astronomy #UKSkies`;
}

function buildInstagramCaption(update) {
  return `${update.socialTitle}\n\n${update.socialSummary}\n\nThe full guide is now live on the site, including safe viewing basics, imaging advice, and practical tips for beginners.\n\nRead it here: ${absoluteUrl(update.url)}\n\n#astrophotography #solareclipse #astronomy #stargazing #spacescience #ukastronomy #nightsky #eclipseguide`;
}

function buildThreadsPost(update) {
  return `${update.socialTitle}\n\n${update.socialSummary}\n\nLink: ${absoluteUrl(update.url)}`;
}

function buildFollowUpPost(update) {
  return `Also updated on the site: ${update.title}. ${update.socialSummary} ${absoluteUrl(update.url)}`;
}

function generateMarkdown() {
  const updates = latestUpdates();
  const featured = updates.find((update) => update.featured) || updates[0];
  const followUps = updates.filter((update) => update !== featured).slice(0, 2);

  return `# Social Post Drafts

These drafts were generated from \`assets/js/site-updates.js\`.

## Posting Note

These accounts cannot be posted to directly from this workspace because there is no authenticated social media publishing access here. Use the copy below for manual posting or for a later API-based workflow.

## Primary Update

### X

${buildXPost(featured)}

### Instagram

${buildInstagramCaption(featured)}

### Threads

${buildThreadsPost(featured)}

## Follow-Up Options

${followUps.map((update) => `- ${buildFollowUpPost(update)}`).join('\n')}
`;
}

fs.writeFileSync(outputPath, generateMarkdown());
console.log(`Wrote ${outputPath}`);