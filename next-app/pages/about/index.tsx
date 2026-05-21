import Head from 'next/head';
import Layout from '../../components/Layout';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About | Our Astro Journey</title>
        <meta
          name="description"
          content="About Our Astro Journey: a beginner astrophotography blog sharing stories, photo experiments, and astronomy learning resources."
        />
      </Head>
      <article className="page-content">
        <h1>About Our Astro Journey</h1>
        <p>Our Astro Journey is a family-led astrophotography blog documenting the learning process from beginner to advanced. We share moon captures, nebula edits, galaxy imaging, and rookie telescope experiences from a Bortle 7 backyard.</p>
        <p>We are focused on real-world astronomy, low-cost gear, and step-by-step photo workflows that help early astrophotographers improve quickly.</p>
      </article>
    </Layout>
  );
}
