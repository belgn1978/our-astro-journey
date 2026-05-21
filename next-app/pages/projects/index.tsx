import Head from 'next/head';
import Layout from '../../components/Layout';

const projects = [
  {
    title: 'Image Processing Practice',
    description: 'Practicing astronomical image processing using datasets from JWST, Hubble, AstroBackyard, Galactic Hunter, and Cosmic Curiosity.',
    items: [
      { name: 'JWST Images', description: 'Processing raw data from the James Webb Space Telescope' },
      { name: 'Hubble Images', description: 'Classic Hubble Space Telescope imagery' },
      { name: 'AstroBackyard Images', description: 'Open cluster and nebula datasets' },
      { name: 'Galactic Hunter Images', description: 'Deep sky nebula and galaxy images' },
      { name: 'Cosmic Curiosity Images', description: 'Star-forming regions and nebulae' }
    ]
  },
  {
    title: 'Equipment Testing',
    description: 'Documenting our telescope setup, camera configurations, lens performance, and equipment behavior in real backyard conditions.',
    items: [
      { name: 'Mobile Phone Astrophotography', description: 'Google Pixel 10 Pro XL night mode and zoom capabilities' },
      { name: 'Lens Comparisons', description: 'Testing different lenses for focal length and optical quality' },
      { name: 'Software Workflows', description: 'Comparing Siril, PixInsight, and other processing tools' }
    ]
  }
];

export default function Projects() {
  return (
    <Layout>
      <Head>
        <title>Projects | Our Astro Journey</title>
        <meta
          name="description"
          content="Our Astro Journey projects: image processing practice, equipment testing, and astrophotography workflow documentation."
        />
      </Head>
      <article className="page-content">
        <h1>Projects</h1>
        <p>Detailed documentation of our astrophotography practice sessions, image processing workflows, and equipment experiments.</p>

        <div className="projects-grid">
          {projects.map((project) => (
            <section key={project.title} className="project-card">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>Focus Areas:</h3>
              <ul className="project-items">
                {project.items.map((item) => (
                  <li key={item.name}>
                    <strong>{item.name}</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--muted)' }}>
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <h2 style={{ marginTop: '2rem' }}>Processing Workflow</h2>
        <p>Our typical workflow involves:</p>
        <ol>
          <li><strong>Data Collection:</strong> Capture raw images using mobile phone or equipment</li>
          <li><strong>Initial Review:</strong> Assess image quality and identify processing opportunities</li>
          <li><strong>Stacking & Alignment:</strong> Combine multiple exposures for noise reduction</li>
          <li><strong>Calibration:</strong> Apply bias, dark, and flat field corrections</li>
          <li><strong>Color Processing:</strong> Balance colors and enhance specific wavelengths</li>
          <li><strong>Contrast Enhancement:</strong> Improve local and global contrast</li>
          <li><strong>Final Touches:</strong> Denoise, sharpen, and prepare for publication</li>
        </ol>

        <h2>Tools We Use</h2>
        <p><strong>Image Processing:</strong> Siril, GIMP, Photoshop</p>
        <p><strong>Data Sources:</strong> JWST Archive, Hubble Legacy Archive, AstroBackyard, Galactic Hunter, Cosmic Curiosity</p>
        <p><strong>Documentation:</strong> Processing notes and before/after comparisons available for each project</p>
      </article>
    </Layout>
  );
}
