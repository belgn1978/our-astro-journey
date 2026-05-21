import Head from 'next/head';
import Layout from '../../components/Layout';

const galleryItems = [
  { 
    title: 'Moon Night Mode', 
    description: 'Lunar photography captured with mobile phone night mode and post-processing in Siril.',
    tag: 'Moon',
    date: '2026-05-12'
  },
  { 
    title: 'IC410 Fire and Tadpole Nebula', 
    description: 'Deep sky nebula imaging with colour blending techniques from Galactic Hunter data.',
    tag: 'Nebula',
    date: '2026-04-18'
  },
  { 
    title: 'IC1805 Heart Nebula', 
    description: 'Wide-field nebula processed using Siril stacking and color enhancement from Cosmic Curiosity dataset.',
    tag: 'Nebula',
    date: '2026-03-22'
  },
  {
    title: 'IC1848 Soul Nebula',
    description: 'Star-forming region processed with Ha-RGB workflow and noise reduction techniques.',
    tag: 'Galaxy',
    date: '2026-03-10'
  },
  {
    title: 'M45 Pleiades',
    description: 'Open star cluster from AstroBackyard dataset processed for color and contrast.',
    tag: 'Star Cluster',
    date: '2026-02-28'
  },
  {
    title: 'IC342 Hidden Galaxy',
    description: 'Spiral galaxy processing with layer blending and local contrast enhancement.',
    tag: 'Galaxy',
    date: '2026-02-14'
  }
];

export default function Gallery() {
  return (
    <Layout>
      <Head>
        <title>Gallery | Our Astro Journey</title>
        <meta
          name="description"
          content="Browse Our Astro Journey gallery: moon photography, nebula imaging, and astrophotography examples from beginner practice sessions."
        />
      </Head>
      <article className="page-content">
        <h1>Gallery</h1>
        <p>Explore our astrophotography practice images and learn how we process deep sky and lunar work. These images showcase our learning journey and different processing techniques.</p>
        
        <div className="card-grid">
          {galleryItems.map((item) => (
            <div key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tag">{item.tag}</span>
                <time style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.date}</time>
              </div>
            </div>
          ))}
        </div>

        <h2>Coming Soon</h2>
        <p>We're working on high-resolution image galleries with detailed processing notes for each image. Check back soon to see our full portfolio with side-by-side before/after comparisons.</p>
      </article>
    </Layout>
  );
}
