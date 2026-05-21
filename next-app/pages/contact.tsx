import { FormEvent, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      setStatus('success');
      setMessage('Thank you! We will notify you when new content is published.');
      setEmail('');
    } else {
      const errorBody = await response.json().catch(() => null);
      setStatus('error');
      setMessage(errorBody?.error || 'Unable to subscribe right now. Please try again later.');
    }
  }

  return (
    <Layout>
      <Head>
        <title>Contact & Subscribe | Our Astro Journey</title>
        <meta
          name="description"
          content="Contact Our Astro Journey and subscribe for email notifications about new astrophotography content."
        />
      </Head>
      <article className="page-content">
        <h1>Subscribe & Contact</h1>
        <p>Join the newsletter to receive email notifications whenever we publish new astrophotography content.</p>
        <form className="subscribe-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
        {message && <div className={`status-message ${status}`}>{message}</div>}
      </article>
    </Layout>
  );
}
