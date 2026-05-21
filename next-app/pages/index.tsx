import Head from 'next/head';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Our Astro Journey | Astrophotography Blog</title>
        <meta
          name="description"
          content="Our Astro Journey is a beginner astrophotography blog sharing moon photos, nebula editing, galaxy imaging, and backyard astronomy tutorials."
        />
      </Head>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Astrophotography Blog</p>
          <h1>Follow Our Astro Journey</h1>
          <p>Beginner-friendly astronomy content, moon photography tips, deep sky imaging, and telescope guides for backyard astrophotography.</p>
          <div className="hero-actions">
            <a className="button" href="/contact">Subscribe</a>
            <a className="button button-secondary" href="/gallery">View Gallery</a>
          </div>
        </div>
      </section>
      <section className="feature-grid">
        <article>
          <h2>Moon Photography</h2>
          <p>Learn how to capture lunar detail, night mode shooting, and editing techniques for amateur astrophotographers.</p>
        </article>
        <article>
          <h2>Nebula & Galaxy Imaging</h2>
          <p>Practice image stacking, colour processing, and raw data workflows for deep sky objects like nebulae and galaxies.</p>
        </article>
        <article>
          <h2>Beginner Astronomy</h2>
          <p>Get telescope setup tips, backyard astronomy advice, and light pollution strategies for your first astrophotography sessions.</p>
        </article>
      </section>
    </Layout>
  );
}
