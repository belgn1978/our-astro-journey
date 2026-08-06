const siteUpdates = [
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