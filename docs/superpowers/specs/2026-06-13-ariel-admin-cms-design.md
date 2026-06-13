# Ariel Admin CMS — Design Spec

**Date:** 2026-06-13
**Status:** Approved design, pending implementation plan
**Author:** Ido Levi (with Claude)

## 1. Purpose

Give Ariel Levi — a designer with no coding experience — a simple, secure, self-service
admin to manage the portfolio: upload/remove/edit/reorder photos and videos, edit all
page text, add/remove projects and sections, and move items between pages. Only Ariel can
access it. Edits go live on the production site without touching code.

## 2. Constraints & decisions (resolved)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Hosting | Vercel (serverless) | Existing target for Next.js; filesystem is read-only/ephemeral. |
| Content persistence | Commit `content.json` to GitHub → auto-redeploy | Free, no DB, single source of truth, free version history/rollback. |
| Media storage | Cloudinary (images + uploaded video) | One service for both; signed uploads; generous free tier. |
| Video input | Both: Cloudinary file upload **and** paste embed link (Behance/YouTube/Vimeo) | Matches existing embed model and adds direct uploads. |
| Auth | Auth.js (NextAuth v5) + Google provider, email allowlist | No password to leak; inherits Google 2FA; only Ariel's account allowed. |
| Scope (v1) | Full CMS: media + all text + add/remove/reorder projects & sections | Per user decision. |
| Preview | In-app live preview from unsaved draft content (no preview deploy) | Instant, reuses existing render components; no extra infra. |
| Domain | Vercel `*.vercel.app`, project renamed to a short subdomain (e.g. `ariellevi.vercel.app`) | Zero cost; custom domain can be added later without rework. |

## 3. Architecture & data flow

```
Ariel ──login──▶ Google (Auth.js)──▶ /admin  (protected by middleware)
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                        ▼                       ▼
          edit text/order        upload photo/video        paste embed link
                  │                        │                       │
                  ▼                        ▼                       ▼
       draft content (in-memory)   POST /api/upload-sign     parsed client-side
                  │              (Cloudinary signature)            │
                  │                        │                       │
                  ├──── live preview ◀─────┴───────────────────────┤
                  │     (renders real components from draft)        │
                  ▼
        Publish ▶ PUT /api/content ▶ validate (Zod) ▶ commit content.json to GitHub
                  ▼
        Vercel auto-redeploy ──▶ live site (~30–60s)
```

- **Single source of truth stays `content.json` in the repo.** The public site keeps
  building statically from it; how pages render text is unchanged.
- The admin never writes to disk on Vercel — it commits the updated JSON to GitHub.
- Media lives in Cloudinary; only URLs/IDs are stored in the JSON.

## 4. Authentication

- **Auth.js (NextAuth v5)** with the **Google provider**.
- Hard **email allowlist**: the `signIn` callback rejects any account whose email
  ≠ `ALLOWED_EMAIL` (Ariel's Google address), even with valid Google credentials.
- **`middleware.ts`** guards `/admin/**`, `PUT /api/content`, and `/api/upload-sign`.
  No session → redirect to sign-in (pages) or `401` (API).
- **Sign-in flow:**
  1. `/admin` with no session → middleware redirects to a minimal sign-in page
     (single "Sign in with Google" button).
  2. Button → `accounts.google.com` (credentials entered on Google's domain only).
  3. Google → `https://<domain>/api/auth/callback/google`; Auth.js verifies, runs the
     allowlist check, sets a signed session cookie, lands on `/admin`.
  4. Session cookie keeps Ariel logged in until expiry/sign-out.
- **Google Cloud setup (one-time):** OAuth client with authorized redirect URIs for
  `https://<domain>/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google`.
- Secrets in Vercel env vars (see §9).

## 5. Content persistence (GitHub commit flow)

- Server util using the **GitHub Contents API** (`@octokit/rest`) with a fine-grained PAT
  (single-repo, contents read/write) stored as an env var.
- **Read:** admin loads the latest `content.json` from GitHub on open (avoids stale views
  between an edit and the redeploy that follows).
- **Save/Publish:** validate against the `Content` schema (**Zod**), then commit to `main`
  with message `content: update via admin`. Vercel rebuilds automatically.
- Every save is a git commit → **free version history and rollback**.
- UX: edits held in local draft state; a single **"Publish changes"** button commits, then
  shows *"Saved — your site updates in about a minute."*

## 6. Media (Cloudinary)

- **Images & uploaded videos:** **signed uploads**. `POST /api/upload-sign` (auth-guarded)
  returns a one-time signature; the browser uploads directly to Cloudinary. We store the
  returned `secure_url`, `public_id`, dimensions, and alt/caption in `content.json`.
- **Embed videos:** Ariel pastes a Behance/YouTube/Vimeo link; the ID + provider are parsed
  client-side and stored as an embed reference.
- **Removal:** drops the item from the `media[]` array; optional best-effort Cloudinary
  delete via `public_id` (non-blocking; orphan cleanup otherwise deferred to Phase 2).

## 7. Data model change — unified `media[]`

Replace per-project `videoIds: string[]` and `images: ProjectImage[]` (and `extraImages`)
with one ordered `media: MediaItem[]`, where each item is exactly one of:

```ts
type MediaItem =
  | { kind: 'image'; url: string; publicId?: string; alt?: string; width?: number; height?: number }
  | { kind: 'embed'; provider: 'adobe' | 'youtube' | 'vimeo'; id: string; caption?: string }
  | { kind: 'video'; url: string; publicId?: string; poster?: string; caption?: string };
```

- **Migration:** one-time script converts current `content.json`:
  existing `videoIds` → `{ kind: 'embed', provider: 'adobe', id }`;
  existing `images`/`extraImages` of `type:'url'` → `{ kind: 'image', ... }`;
  `type:'placeholder'` entries are dropped (they were stand-ins).
- **`extraImages` / "View more":** the expandable behavior is preserved by keeping an
  optional per-project `previewCount` (items beyond it sit behind "View more"); default
  shows all. (Confirms current `ProjectFull` expand/collapse stays functional.)
- **Render components** (`VideoGrid`, `ImagePlaceholder`/`ImageRow`, `ProjectFull`) switch on
  `kind`: `image`/`video` render `<img>`/`<video>`; `embed` renders the provider iframe
  (Adobe player unchanged; YouTube/Vimeo iframes added).
- The `ads` page `groups[].videoIds` follow the same embed shape for consistency.

## 8. Admin UI (designer-friendly)

- **Tabbed dashboard**, one tab per page: **Home · Ads · Bezalel · Personal · Photography ·
  Site settings**, plus a **Preview** toggle.
- Each tab = **structured forms** (never raw JSON) mirroring that page's content:
  - Text inputs for headings, descriptions, skills, about paragraphs, site/contact fields.
  - **Media manager** per project/section: thumbnail grid with **drag-to-reorder**,
    "Upload" (Cloudinary), "Paste link" (embed), per-item caption/alt, delete (✕).
  - **Add/remove** whole projects & sections; **drag-reorder** them.
  - **Move a project between pages** (e.g. Bezalel → Personal).
- **Live preview:** a Preview view mounts the real page components fed with the in-memory
  draft content, so Ariel sees the exact result before publishing.
- Drag-and-drop via **`@dnd-kit`** (lightweight, accessible).
- Non-technical safeguards: inline guidance, confirm-before-delete, disabled Publish while
  an upload is in flight, clear save/publish status.

## 9. Dependencies & environment

- **New deps:** `next-auth@5`, `@octokit/rest`, `cloudinary` (server signing),
  `next-cloudinary` (upload widget), `zod`, `@dnd-kit/core` + `@dnd-kit/sortable`.
- **Env vars (Vercel + local `.env.local`):** `AUTH_SECRET`, `AUTH_GOOGLE_ID`,
  `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAIL`, `GITHUB_TOKEN`, `GITHUB_REPO` (`IdoLevi235/ArielPortfolio`),
  `GITHUB_BRANCH` (`main`), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **`next.config.ts`:** add `res.cloudinary.com` to `images.remotePatterns` (if using
  `next/image`); keep existing `X-Frame-Options` header (note: admin embeds must still work).

## 10. Security notes

- All mutating endpoints and `/admin` require a valid Auth.js session (middleware + per-route check).
- Email allowlist enforced server-side in the `signIn` callback — not just UI.
- Cloudinary uploads are **signed server-side**; no secrets in the browser.
- GitHub PAT is fine-grained, single-repo, contents-only.
- Server-side **Zod validation** of content before any commit (reject malformed payloads).
- `/admin` keeps `robots: noindex`.

## 11. Out of scope for v1

Preview *deploys* (we use in-app preview instead) · multiple admin users/roles ·
automatic orphaned-asset cleanup in Cloudinary · bulk upload · in-app image cropping ·
custom domain (deferred, no rework needed to add).

## 12. Risks

- **`media[]` migration** touches the type, `content.json`, and 3 render components — the
  largest blast radius; covered by the migration script + component updates above.
- **Publish latency** (~1 min rebuild) is mitigated by the instant in-app preview.
- **Concurrent edits** are a non-issue (single user); last-write-wins on commit.
