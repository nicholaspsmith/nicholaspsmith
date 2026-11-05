# Launch checklist

The rebuilt site is on branch `rebuild-charleston-day`. Nothing below has happened. Today the site still runs from `frontend/` on GitHub Pages, and merging this branch is what starts the move.

## Before launch

- [ ] Nicholas reviews all copy, especially `site/src/data/projects.ts`, the home page and the DisasterMaps role wording.
- [ ] Decide how Powell's should be described while it is unfinished.
- [ ] Confirm the owner of CHS Irrigation & Lighting is happy to be shown. Its `REVIEW-BEFORE-LAUNCH.md` says the copy was awaiting review and its photos are stock.
- [ ] Re-export the resume PDF if it should drop the menumon.nicksmith.software link. `site/public/Nicholas_Smith_Resume_2026.pdf` still has it.

## Launch

1. Add repository secrets `CLOUDFLARE_API_TOKEN` (Workers deploy rights) and `CLOUDFLARE_ACCOUNT_ID`.
2. Add routes to `site/wrangler.jsonc`:

   ```jsonc
   "routes": [
     { "pattern": "nicholaspsmith.com", "custom_domain": true },
     { "pattern": "www.nicholaspsmith.com", "custom_domain": true }
   ]
   ```

3. Remove the Cloudflare DNS records for `nicholaspsmith.com` and `www` that point at GitHub Pages. Wrangler refuses a custom domain while a record exists, and the site is briefly down between this and the next step, so do them together.
4. Merge the branch. The workflow tests and deploys it.
5. Check:
   - `https://www.nicholaspsmith.com` passes TLS and redirects to the apex.
   - `https://nicholaspsmith.com/resume` and `/work/zimu` load directly.
6. Turn off GitHub Pages for the repository.
7. Create a Cloudflare Web Analytics site, and set its token as `PUBLIC_CF_BEACON` for the build.

## Rollback

Restore the DNS records, re-enable GitHub Pages, and revert the merge. Pages rebuilds from the old `frontend/` once the old workflow is back.
