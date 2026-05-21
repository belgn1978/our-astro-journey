import Head from 'next/head';
import Layout from '../../components/Layout';

const galleryItems = [
  { title: 'Moon Night Mode', description: 'Lunar photography taken with a mobile phone and post-processing.', tag: 'Moon' },
  { title: 'IC410 Fire and Tadpole', description: 'Deep sky nebula imaging practice with colour blending techniques.', tag: 'Nebula' },
  { title: 'Heart Nebula', description: 'Processing and learning resources for rich star-field imaging.', tag: 'Galaxy' }
];

export default function Gallery() {
  return (
    <Layout>
      <Head>
        <title>Gallery | Our Astro Journey</title>
        <meta
          name="description"
          content="Browse Our Astro Journey gallery examples of moon photography, nebula imaging, and beginner astrophotography experiments."
        />
      </Head>
      <article className="page-content">
        <h1>Gallery</h1>
        <p>Explore recent astrophotography practice images and learn how we process deep sky and lunar work.</p>
        <div className="card-grid">
          {galleryItems.map((item) => (
            <div key={item.title} className="card">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span className="tag">{item.tag}</span>
            </div>
          ))}
        </div>
      </article>
    </Layout>
  );
}
