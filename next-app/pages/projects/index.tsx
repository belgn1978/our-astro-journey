import Head from 'next/head';
import Layout from '../../components/Layout';

const projects = [
  {
    title: 'Image Processing Practice',
    description: 'Practice processing astronomical images from public datasets using Siril and other tools.',
    items: [
      { name: 'JWST Images', href: '#jwst' },
      { name: 'Hubble Images', href: '#hubble' },
      { name: 'AstroBackyard Images', href: '#astro' },
      { name: 'Galactic Hunter Images', href: '#galaxy' },
      { name: 'Cosmic Curiosity Images', href: '#cosmic' }
    ]
  },
  {
    title: 'Equipment Testing',
    description: 'Documenting telescope setup, camera configurations, and equipment performance in the field.'
  }
];

export default function Projects() {
  return (
    <Layout>
      <Head>
        <title>Projects | Our Astro Journey</title>
        <meta
          name="description"
          content="Explore Our Astro Journey projects: image processing practice, equipment testing, and astrophotography workflow documentation."
        />
      </Head>
      <article className="page-content">
        <h1>Projects</h1>
        <p>Detailed documentation of our astrophotography practice sessions and equipment experiments.</p>
        <div className="projects-grid">
          {projects.map((project) => (
            <section key={project.title} className="project-card">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {project.items && (
                <ul className="project-items">
                  {project.items.map((item) => (
                    <li key={item.name}>
                      <a href={item.href}>{item.name}</a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </Layout>
  );
}
