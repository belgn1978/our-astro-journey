const siteUpdates = [
  {
    date: '2026-08-06',
    badge: 'New onboarding',
    title: 'Start Here and beginner learning pages are live',
    summary: 'New pages now guide beginners from first setup through smart telescope prep, first-night checklists, common mistakes, and a staged learning path for consistent progress.',
    url: './start-here.html',
    cta: 'Open Start Here',
    featured: true,
    socialTitle: 'New beginner onboarding pages are now live',
    socialSummary: 'We launched Start Here, learning path, setup, and checklist pages to help beginners progress faster with less confusion.'
  },
  {
    date: '2026-08-06',
    badge: 'New learning path',
    title: 'Beginner astronomy learning path is live',
    summary: 'A staged learning path now breaks the beginner journey into first nights, better planning, consistent sessions, and simple processing habits.',
    url: './beginner-learning-path.html',
    cta: 'View learning path',
    featured: true,
    socialTitle: 'Beginner astronomy learning path is now live',
    socialSummary: 'We have published a staged beginner learning path so new users can build confidence without guesswork.'
  },
  {
    date: '2026-08-06',
    badge: 'New checklist',
    title: 'First-night checklist and setup guide are live',
    summary: 'New practical pages cover the first session, smart telescope setup basics, and the most common mistakes that slow beginners down.',
    url: './first-night-checklist.html',
    cta: 'Open checklist',
    featured: true,
    socialTitle: 'First-night checklist and setup guidance published',
    socialSummary: 'We published the first-night checklist plus setup guidance to help beginners get a reliable first result.'
  },
  {
    date: '2026-08-06',
    badge: 'Transparency update',
    title: 'How we test astronomy gear',
    summary: 'A methodology page explains our beginner-focused testing principles, observing conditions, disclosures, and review context.',
    url: './how-we-test-gear.html',
    cta: 'Read testing method',
    featured: false,
    socialTitle: 'How We Test Gear page published',
    socialSummary: 'We published a transparent testing-method page so beginners can understand our review context and criteria.'
  },
  {
    date: '2026-07-30',
    badge: 'New guide',
    title: 'Solar eclipse safety and imaging guide',
    summary: 'A beginner-friendly eclipse guide covering certified solar glasses, front-mounted filters for cameras and telescopes, smartphone tips, UK viewing notes, and five simple experiments using household items.',
    url: './solar-eclipse-guide.html',
    cta: 'Read the eclipse guide',
    featured: true,
    socialTitle: 'New on Our Astro Journey: solar eclipse safety guide',
    socialSummary: 'We have published a new solar eclipse safety and imaging guide with viewing advice, camera and telescope filter tips, UK notes, and five simple household experiments.'
  },
  {
    date: '2026-07-30',
    badge: 'Updated resource page',
    title: 'Useful resources now includes downloads',
    summary: 'The resources page now highlights the downloadable PDF version of the eclipse guide, so visitors can read online or keep an offline copy for eclipse day planning.',
    url: './useful-resources.html',
    cta: 'Open useful resources',
    featured: false,
    socialTitle: 'Useful Resources page updated',
    socialSummary: 'The Useful Resources page now includes direct access to the new eclipse guide in both online and PDF form.'
  },
  {
    date: '2026-07-30',
    badge: 'Always current',
    title: 'Astronomy calendar and upcoming events',
    summary: 'The news section remains the quickest way to check eclipses, meteor showers, supermoons, and launches, with both calendar and event views for upcoming sky activity.',
    url: './news.html',
    cta: 'See upcoming events',
    featured: false,
    socialTitle: 'Upcoming sky events are live on the calendar',
    socialSummary: 'Check the astronomy calendar for upcoming eclipses, meteor showers, supermoons, and launch events.'
  }
];

if (typeof window !== 'undefined') {
  window.siteUpdates = siteUpdates;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { siteUpdates };
}