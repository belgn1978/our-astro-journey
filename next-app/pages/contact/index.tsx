import Head from 'next/head';
import Layout from '../../components/Layout';

export default function Contact() {
  return (
    <Layout>
      <Head>
        <title>Contact | Our Astro Journey</title>
        <meta
          name="description"
          content="Contact Our Astro Journey. Get in touch with questions about astrophotography, image processing, or our journey."
        />
      </Head>
      <article className="page-content">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Whether you have questions about astrophotography, want to share your own experiences, or just want to say hello, feel free to reach out.</p>

        <div className="feature-grid">
          <article>
            <h3>📧 Email</h3>
            <p>Have a question about astrophotography or our content? Send us an email and we'll get back to you as soon as possible.</p>
            <p><strong>Coming soon</strong></p>
          </article>
          <article>
            <h3>📱 Social Media</h3>
            <p>Follow us on social media for updates, behind-the-scenes content, and daily astrophotography tips.</p>
            <p><strong>Links coming soon</strong></p>
          </article>
          <article>
            <h3>💬 Community</h3>
            <p>Join our community of beginner astrophotographers, share your images, and learn together.</p>
            <p><strong>Community platform launching soon</strong></p>
          </article>
        </div>

        <h2>What We're Currently Working On</h2>
        <ul>
          <li>Detailed image processing tutorials with before/after comparisons</li>
          <li>Equipment reviews and budget recommendations</li>
          <li>Interactive night sky guides and observation logs</li>
          <li>Live Q&A sessions about astrophotography</li>
          <li>Community gallery for reader submissions</li>
        </ul>

        <h2>Subscribe for Updates</h2>
        <p>Email subscription feature is coming soon! In the meantime, bookmark this site or check back regularly for new content and updates.</p>
      </article>
    </Layout>
  );
}
