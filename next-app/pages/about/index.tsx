import Head from 'next/head';
import Layout from '../../components/Layout';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About | Our Astro Journey</title>
        <meta
          name="description"
          content="About Our Astro Journey: a beginner astrophotography blog by Matt and Lacey learning from a Bortle 7 backyard."
        />
      </Head>
      <article className="page-content">
        <h1>About Our Astro Journey</h1>
        <p>Our Astro Journey is a family-led astrophotography blog documenting the learning process from beginner to advanced. We share moon captures, nebula edits, galaxy imaging, and rookie telescope experiences from a Bortle 7 backyard.</p>
        <p>We are focused on real-world astronomy, low-cost gear, and step-by-step photo workflows that help early astrophotographers improve quickly.</p>
        
        <h2>Our Story</h2>
        <p>My name is Matt and my daughter's name is Lacey. Neither of us have professional backgrounds in astrophotography, but we both share a passion for learning and exploring the cosmos from our backyard.</p>
        <p>We started with mobile phone photography to keep costs low and have been gradually improving our techniques and equipment. Despite living in a Bortle 7 area with significant light pollution, we're determined to capture the beauty of the night sky.</p>
        
        <h2>Our Approach</h2>
        <ul>
          <li><strong>Beginner-Friendly:</strong> We document everything from the perspective of learners, not experts</li>
          <li><strong>Budget-Conscious:</strong> Starting with mobile phones and affordable gear</li>
          <li><strong>Transparent:</strong> Sharing both successes and failures in our astrophotography journey</li>
          <li><strong>Community-Focused:</strong> Learning from and contributing to the astrophotography community</li>
        </ul>

        <h2>What You'll Find Here</h2>
        <p>On Our Astro Journey, you'll discover:</p>
        <ul>
          <li>Moon photography techniques and processing guides</li>
          <li>Deep sky imaging tutorials for nebulae and galaxies</li>
          <li>Equipment reviews from a budget perspective</li>
          <li>Processing workflows and before/after comparisons</li>
          <li>Tips for backyard astronomy in light-polluted areas</li>
        </ul>
      </article>
    </Layout>
  );
}
