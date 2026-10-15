# Next.js migration app

This is the isolated App Router foundation for the Our Astro Journey migration. The existing root HTML site remains the production website while pages and tools are migrated here.

## Current state

- Next.js 16, React and TypeScript foundation.
- Static export configured to create the deployable site in next-app/out.
- Shared header, responsive-menu interaction and footer are in place.
- Existing CSS and brand assets are copied into next-app/public from the current site.
- The preview page is explicitly incomplete; it must not be deployed as the replacement website.

## Local development

Requires Node.js 20.9 or later. From this directory, run npm install once to create and commit the npm lockfile, then use npm run dev, npm run typecheck and npm run build.

The existing IONOS workflow currently uses Node 18 and npm ci. Update its Node version and produce/commit the lockfile before attempting any build or deployment. Do not dispatch that workflow until its target directory is confirmed to be a new isolated staging directory. The workflow currently deletes files in its configured target directory before uploading.

## URL compatibility

App Router routes such as /about export to files named about.html with the current trailingSlash setting. Keep public links and canonical metadata on the existing .html URLs. Verify generated output paths and Apache .htaccess behavior before staging.

## Assets

The original stylesheet and brand image files are duplicated into public/assets for the independent build. Keep the root production copies intact until cutover has been approved and rollback is no longer needed.
