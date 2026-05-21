import Head from 'next/head';
import Layout from '../../components/Layout';

const newsItems = [
  { 
    title: 'New telescope session log', 
    date: '2026-05-12', 
    summary: 'Sharing a backyard imaging session with sky conditions, gear notes, and processing results.',
    category: 'Session Report'
  },
  { 
    title: 'Nebula editing guide', 
    date: '2026-04-25', 
    summary: 'A comprehensive walkthrough of stacking and colour balancing for deep sky nebula processing in Siril.',
    category: 'Tutorial'
  },
  { 
    title: 'Better moon photography', 
    date: '2026-03-18', 
    summary: 'Tips for capturing moon detail using mobile phone exposure control, manual focus, and post-processing.',
    category: 'Guide'
  },
  {
    title: 'Handling light pollution challenges',
    date: '2026-03-05',
    summary: 'Strategies and techniques for improving astrophotography in Bortle 7 areas with significant light pollution.',
    category: 'Tips'
  },
  {
    title: 'Processing software comparison',
    date: '2026-02-20',
    summary: 'Comparing Siril, PixInsight, and other free tools for astrophotography image processing workflows.',
    category: 'Resource'
  }
];

export default function News() {
  return (
    <Layout>
      <Head>
        <title>News | Our Astro Journey</title>
        <meta
          name="description"
          content="Stay updated with Our Astro Journey astrophotography news, processing guides, and telescope practice notes."
        />
      </Head>
      <article className="page-content">
        <h1>News & Updates</h1>
        <p>Latest blog updates, astrophotography practice sessions, and new content announcements. Follow our journey as we learn and grow in astrophotography.</p>
        
        <div className="timeline">
          {newsItems.map((item) => (
            <div key={item.title} className="timeline-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h3>
                <span className="tag" style={{ marginLeft: 'auto' }}>{item.category}</span>
              </div>
              <time dateTime={item.date}>{new Date(item.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              <p style={{ margin: '0.5rem 0 0 0' }}>{item.summary}</p>
            </div>
          ))}
        </div>

        <h2>Subscribe for Updates</h2>
        <p>Want to stay in the loop? <a href="/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}>Subscribe to our newsletter</a> for new content announcements and astrophotography tips.</p>
      </article>
    </Layout>
  );
}
