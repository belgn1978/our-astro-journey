# Our Astro Journey Next.js Prototype

This is a secure Next.js prototype for `Our Astro Journey`.

## Setup

```bash
cd next-app
npm install
npm run dev
```

## Notes

- Uses Next.js pages for multi-page routing.
- Includes an API route for subscriber registration with MySQL placeholders.
- Uses environment variables for database credentials.

## Environment Variables

Create a `.env.local` file with:

```env
MYSQL_HOST=your-host
MYSQL_USER=your-user
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=your-database
```
