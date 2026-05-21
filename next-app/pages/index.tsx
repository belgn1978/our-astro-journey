import Head from 'next/head';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Our Astro Journey | Astrophotography Blog</title>
        <meta
          name="description"
          content="Our Astro Journey is a beginner astrophotography blog sharing moon photos, nebula editing, galaxy imaging, and backyard astronomy tutorials. Learn astrophotography from a Bortle 7 backyard."
        />
        <meta property="og:title" content="Our Astro Journey | Astrophotography Blog" />
        <meta property="og:description" content="Beginner astrophotography blog with moon photography, nebula imaging, and telescope guides." />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Astrophotography Blog</span>
          <h1>Follow Our Astro Journey</h1>
          <p>Beginner-friendly astronomy content, moon photography tips, deep sky imaging, and telescope guides for backyard astrophotography in light-polluted skies.</p>
          <div className="hero-actions">
            <a className="button" href="/contact">Subscribe</a>
            <a className="button button-secondary" href="/gallery">View Gallery</a>
            <a className="button button-secondary" href="/projects">View Projects</a>
          </div>
        </div>
      </section>

      <section>
        <h2>Featured Topics</h2>
        <div className="feature-grid">
          <article>
            <h3>🌙 Moon Photography</h3>
            <p>Learn how to capture lunar detail, night mode shooting, and editing techniques for amateur astrophotographers using mobile phones and entry-level equipment.</p>
          </article>
          <article>
            <h3>🌌 Nebula & Galaxy Imaging</h3>
            <p>Practice image stacking, colour processing, and raw data workflows for deep sky objects like nebulae and galaxies using Siril and other tools.</p>
          </article>
          <article>
            <h3>🔭 Beginner Astronomy</h3>
            <p>Get telescope setup tips, backyard astronomy advice, and light pollution strategies for your first astrophotography sessions.</p>
          </article>
        </div>
      </section>

      <section>
        <h2>Get Started</h2>
        <div className="feature-grid">
          <article>
            <h3>📚 About Us</h3>
            <p>Meet Matt and Lacey as we document our astrophotography learning journey from a Bortle 7 backyard with limited resources.</p>
            <a href="/about" className="button button-secondary">Learn More</a>
          </article>
          <article>
            <h3>📸 Gallery</h3>
            <p>Browse our collection of moon photos, nebula images, and galaxy captures processed with various techniques and workflows.</p>
            <a href="/gallery" className="button button-secondary">View Gallery</a>
          </article>
          <article>
            <h3>📖 Latest News</h3>
            <p>Stay updated with our latest astrophotography experiments, processing guides, and telescope session notes.</p>
            <a href="/news" className="button button-secondary">Read News</a>
          </article>
        </div>
      </section>
    </Layout>
  );
}
