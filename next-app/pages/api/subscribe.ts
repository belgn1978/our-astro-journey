import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

type Data = {
  success: boolean;
  error?: string;
};

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', ['POST']).status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    });

    await connection.execute(
      `INSERT INTO subscribers (email, created_at) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE created_at = NOW()`,
      [email]
    );

    await connection.end();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ success: false, error: 'Subscription failed. Please try again later.' });
  }
}
