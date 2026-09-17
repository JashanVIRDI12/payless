# Deploy Payless to cPanel

## Confirmed cause and immediate repair

The supplied Apache log reports `AH00529` / `(13)Permission denied` while
checking `/home/x4ypi5pnd88b/public_html/_next/static/.htaccess`. Apache cannot
traverse that directory or read an existing access file, so it rejects all
the CSS, JavaScript, fonts and images beneath it. This message does not prove
that `.htaccess` exists: Apache must be able to check even when it is absent.

In **cPanel > File Manager**, enable **Show Hidden Files**. Set `_next`,
`_next/static`, and every directory inside them to **755**. Set every file
inside `_next`, including any existing `.htaccess`, to **644**. Do not apply
644 to folders: folders need the execute/search bit for Apache to traverse them.

Alternatively, paste into **cPanel Terminal** (not your local Windows terminal):

```sh
cd /home/x4ypi5pnd88b/public_html && (
  chmod 755 _next _next/static &&
  find _next -type d -exec chmod 755 {} \; &&
  find _next -type f -exec chmod 644 {} +
)
```

Then reload the site. If chmod reports `Operation not permitted`, or the same
AH00529 continues with 755/644 in place, send hosting support this request:

> Please fix Apache read/traverse access for
> /home/x4ypi5pnd88b/public_html/_next/static. The site returns AH00529 with
> (13)Permission denied while checking .htaccess. Verify ownership for cPanel
> user x4ypi5pnd88b, every parent directory's search permission, and any ACL or
> security context restricting Apache. Preserve the cPanel document-root
> ownership/group configuration. Confirm a real CSS file returns HTTP 200.

The log's domain is **paylestowing.ca** (one `s`), while the source's canonical
metadata currently says **paylesstowing.ca** (two `s` characters). Verify the
deployment on the former; confirm the intended canonical domain before changing
metadata. The permission repair is independent of that naming difference.

## Build the upload

```sh
npm ci
npm run build:cpanel
```

On Windows use `npm.cmd` if PowerShell blocks `npm`.

Upload **`cpanel-upload.zip`**. It contains the contents of `out/` directly,
including `.htaccess`, `_next/`, all navigation payloads, and each page's
`index.html`. Its Unix permissions are explicitly set to **0644 for files**
and **0755 for directories**, including when generated on Windows. This is a
static website; cPanel does not need Node.js or `next start` to serve it.

Do not reuse the old `public_html.zip`: it contains 0666 files, 0777 folders,
an extra enclosing folder, and subpage directories without index files.

## Upload in File Manager

1. In **cPanel > Domains**, find the **Document Root** for `paylestowing.ca`.
   Open that exact directory in File Manager (usually `public_html`).
2. Enable **Settings > Show Hidden Files**. Download a backup of the current
   website and its `.htaccess` outside the public website before replacing files.
   If this directory also hosts other applications, preserve their files and
   any application-specific rules.
3. Upload `cpanel-upload.zip` into the document root and **Extract** it there,
   allowing the new website files to replace the old versions. There must be
   an `index.html` and `_next` directly in the document root, not inside another
   `public_html` or `out` directory. Make sure the included `.htaccess` replaces
   the previous site's rewrite rules for this static website.
4. Inspect permissions after extraction. Some extractors do not change modes
   of directories that already exist. Set `_next` and **all its subfolders**
   to **755**, and files inside them to **644**. Apply those modes to the other
   exported page folders/files too. Keep the hosting provider's ownership and
   permissions on the document root itself.
5. Remove the uploaded ZIP from the public website, clear any hosting/CDN page
   cache, and reload with **Ctrl+Shift+R**. Keep previous hashed `_next/static`
   files during updates so visitors with an older open page can still use it.

For an existing extraction, cPanel Terminal can normalize just this export's
files. First `cd` into the document root identified in step 1, confirm `pwd`,
then run the following. These commands deliberately leave the document root
and unrelated applications alone:

```sh
for folder in _next about contact fleet services _not-found 404; do
  if [ -d "$folder" ]; then
    chmod 755 "$folder"
    find "$folder" -type d -exec chmod 755 {} \;
    find "$folder" -type f -exec chmod 644 {} +
  fi
done
find . -maxdepth 1 -type f \( -name '*.html' -o -name '*.txt' -o -name '*.xml' -o -name 'icon.png' -o -name 'payless-logo.webp' -o -name '.htaccess' \) -exec chmod 644 {} +
```

## Confirm the deployment

Run this locally after uploading, using the same build you uploaded:

```sh
npm run verify:deployment -- https://paylestowing.ca
```

It requests the exported pages, JavaScript, CSS, fonts, images, and navigation
payloads and detects forbidden files, stale builds, and HTML returned in place
of assets. Also open `/about/`, `/services/`, `/fleet/`, and `/contact/` directly
and refresh each one. The console should no longer show asset 403s.

## If any asset still returns 403

A 403 is a server access denial. Changing React code, renaming `_next`, or
rebuilding alone cannot fix a host-level denial. Open **cPanel > Metrics >
Errors**, reload one of the exact failing asset URLs, and inspect the new entry:

| Log evidence | Required correction |
| --- | --- |
| `Permission denied` / missing search permissions | Correct that file and all parent directory permissions; ask the host to correct ownership if needed. |
| `client denied by server configuration` | Have the host identify the matching Apache access rule in this or a parent directory. Remove only the unintended restriction. |
| ModSecurity rule ID / hotlink denial | Ask the host for a narrow exception for the identified rule and the affected public assets. Do not disable protection globally. |
| `No matching DirectoryIndex` | Confirm the new page folder contains `index.html` and the included `.htaccess` was installed. |

Give the host one exact failing `/_next/static/...` URL and its error-log line.
Files existing in File Manager is not proof Apache can read them. If the new
`.htaccess` instead produces a 500 with `not allowed here`, ask the host to
allow that named directive or configure its equivalent in the virtual host.

References: [cPanel's AH00529 diagnosis](https://support.cpanel.net/hc/en-us/articles/360048083394-How-to-address-common-403-errors-on-your-website),
[cPanel's standard file and directory permissions](https://support.cpanel.net/hc/en-us/articles/360050418594-What-are-the-default-file-permissions-for-public-html),
[cPanel's missing directory index explanation](https://support.cpanel.net/hc/en-us/articles/1500010949202-403-error-Cannot-serve-directory-No-matching-DirectoryIndex).
