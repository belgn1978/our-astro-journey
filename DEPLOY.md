Deploy (IONOS + GitHub Actions)

Quick steps — what you need to do on IONOS (keep it simple):

1. Create an SSH deploy key locally:

```bash
ssh-keygen -t ed25519 -C "deploy@our-astro-journey" -f deploy_key -N ""
```

2. On IONOS: add the public key (`deploy_key.pub`) to the SFTP/SSH key area for the site user
   (or paste into `~/.ssh/authorized_keys` for that SFTP account).

3. Confirm the site webroot path (common examples):
- `/htdocs/your-site/`
- `/web/htdocs/<user>/` 
Note: use the exact path where files should be served.

4. In GitHub repository settings → Secrets → Actions, add these secrets:
- `IONOS_HOST` (SFTP host)
- `IONOS_USERNAME` (SFTP username)
- `IONOS_SSH_PRIVATE_KEY` (paste the private key file contents from `deploy_key`)
- `IONOS_TARGET_DIR` (remote path, e.g. `/htdocs/your-site/`)

5. Optional but recommended: create a dedicated SFTP user restricted to the target directory.

Test locally (optional):
```bash
cd next-app
npm ci
npm run build
scp -r out/* your-user@your-sftp-host:/path/to/target/
```

How deployment works after this
- Push to `main` (or run the workflow manually) and GitHub Actions will build `next-app`,
  clean the remote target directory, and upload the generated `next-app/out/` files.

That's it — once the secrets and public key are in place, you only need to push code to GitHub.

If you want, I can also add a one-click checklist or screenshots for the IONOS panel.
