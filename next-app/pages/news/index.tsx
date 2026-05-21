import Head from 'next/head';
import Layout from '../../components/Layout';

const newsItems = [
  { title: 'New telescope session log', date: '2026-05-12', summary: 'Sharing a backyard imaging session with sky conditions, gear notes, and processing results.' },
  { title: 'Nebula editing guide', date: '2026-04-25', summary: 'A walkthrough of stacking and colour balancing for deep sky nebula processing.' },
  { title: 'Better moon photography', date: '2026-03-18', summary: 'Tips for capturing moon detail using mobile phone exposure control and post-processing.' }
];

export default function News() {
  return (
    <Layout>
      <Head>
        <title>News | Our Astro Journey</title>
        <meta
          name="description"
          content="Stay updated with the latest Our Astro Journey astrophotography news, processing guides, and telescope practice notes."
        />
      </Head>
      <article className="page-content">
        <h1>News</h1>
        <p>Latest blog updates, astrophotography practice sessions, and new content announcements.</p>
        <div className="timeline">
          {newsItems.map((item) => (
            <div key={item.title} className="timeline-item">
              <h2>{item.title}</h2>
              <time>{item.date}</time>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      </article>
    </Layout>
  );
}
