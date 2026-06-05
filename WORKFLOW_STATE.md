# Workflow State

## Request
Create a simple Next.js project that allows image upload with validation and client-side preview.

## Clarified Scope
- Next.js App Router (v13+)
- TypeScript
- Plain CSS (global stylesheet, no Tailwind, no CSS Modules)
- Client-side only — image never leaves the browser
- Upload UI supports both click-to-upload and drag & drop
- Validation errors shown as visible messages to the user
- Valid image displayed at the bottom of the page
- A new upload overwrites the previously displayed image
- Invalid uploads do NOT replace the current valid preview

## Open Questions
- None

## Constraints
- Max file size: 5MB
- Accepted formats: jpg and png only
- No server/API routes needed
- No external styling libraries

## Acceptance Criteria
1. User can click the upload area OR drag & drop an image onto it
2. File is validated on selection: must be jpg/png and ≤ 5MB
3. If invalid, a clear error message is shown (wrong type or too large); existing valid preview is preserved
4. If valid, the image is displayed at the bottom of the page using a preview URL
5. The upload area remains available to upload a new image at any time
6. Uploading a new valid image replaces the previously displayed one
7. Error messages are cleared when a new valid file is selected
8. Previous `URL.createObjectURL()` is revoked when replaced or on unmount (no memory leaks)
9. File input is reset after each selection so the same file can be re-selected
10. Upload zone is keyboard-accessible via a `<label>` tied to a hidden `<input type="file">`

## Plan
1. Scaffold a new Next.js project in `image-uploader/` via `create-next-app` with App Router + TypeScript
2. Create `app/page.tsx` as a `"use client"` component with:
   - State: `previewUrl: string | null`, `errorMessage: string | null`
   - A `ref` to the hidden `<input type="file">` for programmatic reset
   - A `useEffect` cleanup to revoke the object URL on unmount
   - A `validateFile(file: File): string | null` helper — checks MIME type (`image/jpeg`, `image/png`) and file size (≤ 5MB), returns error string or null
   - A `handleFile(file: File)` function that runs validation, revokes the previous object URL, sets new `previewUrl` or sets `errorMessage` (keeping existing preview on failure)
   - Upload `<label>` (wrapping a hidden `<input type="file" accept="image/jpeg,image/png">`) that acts as the clickable upload zone
   - Drag & drop handlers on the `<label>`: `onDragOver` (preventDefault), `onDrop` (extract file, call `handleFile`)
   - `onChange` on the input: call `handleFile`, then reset `input.value = ""`
   - Error message `<p>` rendered when `errorMessage` is set
   - Preview `<img>` rendered at the bottom when `previewUrl` is set
3. Style everything in `app/globals.css` (already imported via `layout.tsx`)
4. Leave `app/layout.tsx` as default (auto-generated)
5. No API routes, no external dependencies beyond Next.js defaults

## Debate Notes
- Debater verdict: revise before implementation
- Accepted all debater suggestions:
  - Use globals.css instead of page.module.css
  - Add URL.createObjectURL() cleanup on replace and unmount
  - Reset file input after each selection
  - Use <label> for accessibility instead of clickable <div>
  - Validate MIME type + extension in code (not just accept attribute)
  - Keep last valid preview when invalid file is attempted

## Files To Change
- `image-uploader/app/page.tsx` — main upload UI and validation logic
- `image-uploader/app/globals.css` — all styles (upload zone, error, preview)
- `image-uploader/app/layout.tsx` — default layout import + metadata retained as scaffold default text
- `image-uploader/src/app/page.tsx` — removed (moved implementation to `app/page.tsx` per approved plan)
- `image-uploader/src/app/globals.css` — removed (moved styling to `app/globals.css` per approved plan)
- `image-uploader/src/app/layout.tsx` — removed (moved layout import path to `app/layout.tsx`)

## Implementation Notes
- Scaffolded new Next.js App Router + TypeScript app in `image-uploader/` using:
  - `npx create-next-app@latest image-uploader --app --typescript --no-tailwind --no-eslint --src-dir no --import-alias "@/*" --yes`
- Context7 verification used for create-next-app CLI option behavior (library: `/vercel/next.js`).
- Implemented upload page logic in `image-uploader/app/page.tsx`:
  - `"use client"` component
  - state: `previewUrl`, `errorMessage`
  - hidden file input + `<label>` upload zone (click + drag/drop)
  - validation helper for MIME + extension (`jpg/jpeg/png`) and max size 5MB
  - keeps prior valid preview on invalid upload
  - clears error on valid upload
  - resets input value after selection/drop to allow re-selecting same file
  - revokes previous object URL when replaced and on unmount (memory leak prevention)
- Implemented all styling in `image-uploader/app/globals.css` (plain global CSS only, no Tailwind/CSS modules).
- Added `image-uploader/app/layout.tsx` to import `./globals.css` from the `app/` directory and preserve default generated metadata text.
- Removed scaffolded `src/app` route files so App Router resolves to `app/` files required by approved plan.
- Verification:
  - `npm run build` (in `image-uploader/`) ✅ success
- Addressed review findings in `image-uploader/app/page.tsx`:
  - Moved hidden file input inside the upload `<label>` so keyboard focus lands within the label and the existing `.uploadZone:focus-within` style is visibly applied.
  - Added accessible live error announcement: `role="alert" aria-live="polite"` on the error `<p>`.
- Re-verified requested behaviors from implementation logic:
  - Invalid upload preserves current preview: still true (`handleFile` sets `errorMessage` and returns early without changing `previewUrl`).
  - Same-file reselection works: still true (input value reset in `onChange` and after drop via ref).
  - Object URL cleanup/replacement: still true (revokes prior URL before replace; cleanup on unmount in `useEffect` return).
- Post-fix verification:
  - `npm run build` (in `image-uploader/`) ✅ success

## Review Findings
- Verdict: Approved
- Scope reviewed:
  - `image-uploader/app/page.tsx`
  - `image-uploader/app/globals.css`
  - `image-uploader/app/layout.tsx`
- Correctness:
  - Click-to-upload is implemented with a `<label>` bound to the hidden file input.
  - Drag & drop is implemented via `onDragOver` + `onDrop` on the same upload zone.
  - Validation correctly rejects non-JPG/PNG files and files larger than 5MB.
  - Invalid uploads do not replace an existing valid preview.
  - Valid uploads create a preview with `URL.createObjectURL()`, clear any prior error, and replace the previous preview.
  - Previous object URLs are revoked both when replacing a preview and on component unmount.
  - File input is reset after both manual selection and drop, allowing same-file reselection.
- Accessibility:
  - AC10 is met: the upload zone is a `<label>` tied to a hidden `<input type="file">`.
  - The hidden input remains focusable, and `.uploadZone:focus-within` provides a visible keyboard focus state.
  - Error messaging is accessible via `role="alert"` and `aria-live="polite"`.
  - `app/layout.tsx` keeps `<html lang="en">`.
  - Preview image has a meaningful `alt` attribute.
- Edge cases reviewed:
  - Empty selections are ignored safely.
  - Dropping/selecting multiple files uses the first file only, which is consistent with the scoped single-image uploader.
  - Uppercase extensions are accepted because validation normalizes to lowercase.
  - A failed upload after a valid one preserves the last valid preview as required.
- Styling/consistency:
  - All page styling is in `app/globals.css` as required.
  - `app/page.tsx` is correctly marked with `"use client"` because it uses hooks and browser APIs.
  - `app/layout.tsx` correctly imports global CSS and uses the App Router metadata pattern.
- Acceptance Criteria check:
  - AC1 ✅ click or drag/drop supported
  - AC2 ✅ file type and size validation enforced
  - AC3 ✅ invalid upload shows clear error and preserves existing preview
  - AC4 ✅ valid upload renders preview at bottom using object URL
  - AC5 ✅ upload zone remains available after upload
  - AC6 ✅ new valid upload replaces previous preview
  - AC7 ✅ error clears on new valid upload
  - AC8 ✅ old object URL revoked on replace/unmount
  - AC9 ✅ file input reset after each selection
  - AC10 ✅ keyboard-accessible label + hidden input pattern used
- Context7 verification:
  - Verified current Next.js App Router guidance for importing global CSS in `app/layout.tsx`, using `metadata`, and requiring `"use client"` for hook/browser-API usage (`/vercel/next.js`).
- Verification performed:
  - `npm run build` in `image-uploader/` ✅ passed
- No blocking issues found. Ready for security review.

## Test Results
- `npm run build` (image-uploader/) — ✅ PASSED
  - Next.js 16.2.7 (Turbopack), compiled successfully in 2.7s
  - TypeScript check: clean
  - Static page `/` pre-rendered successfully
- `npm run lint` — not available (project scaffolded with `--no-eslint`, no lint script present)
- No unit test framework configured (create-next-app defaults, out of scope)

## Security Findings
Security review passed — no significant issues found.

Reviewed: `image-uploader/app/page.tsx`, `app/globals.css`, `app/layout.tsx`

- Hardcoded secrets: None. No API keys, passwords, or credentials present.
- XSS via object URL: `URL.createObjectURL()` produces a `blob:` URL used only in `<img src>`. Browsers treat blob URLs as binary data — no script execution path. `errorMessage` is set from hardcoded constant strings only, never from user-supplied input. No XSS vector.
- MIME type bypass (Low): `file.type` is browser/OS-reported and can be spoofed by renaming a file. However, since this is client-side preview only with no server processing, the worst case is a broken image render. No data exfiltration, no code execution. Acceptable for this scope.
- Input validation gaps: None found. MIME type + extension double-check is in place. `file.size` is reliable. Missing extension defaults to `""` which is correctly rejected. Multi-dot filenames (e.g. `file.exe.jpg`) are handled correctly — `pop()` returns the last extension.
- `dangerouslySetInnerHTML`, `eval()`, dynamic scripts: None used.
- No server-side code or API routes — minimal attack surface.

## Lint Results
- `npx tsc --noEmit` (image-uploader/) — ✅ PASSED (no output, zero type errors)
- `npm run build` (image-uploader/) — ✅ PASSED
  - Next.js 16.2.7 (Turbopack), compiled in 1818ms
  - TypeScript check: clean
  - Static page `/` pre-rendered successfully
- No ESLint configured (project scaffolded with `--no-eslint`)

## Commit Message Draft
- feat(image-uploader): add Next.js TypeScript image uploader; remove Serena configs

  - Add `image-uploader/` Next.js App Router + TypeScript app with client-side
    image upload UI (click + drag/drop), file validation (jpg/png, ≤5MB),
    accessible label/input, preview via `URL.createObjectURL()` with proper
    cleanup on replace/unmount, and input reset to allow same-file reselection.

  - Remove Serena-related configuration and agent files (.serena/*,
    .opencode/agents/security-reviewer.md) and update AGENTS.md and
    opencode.json accordingly.

## Current Status
Phase 10 - Commit message drafted. Build and TypeScript check are clean; ready for commit.

Handoff: commit-message drafted. Next: create a commit including the new
`image-uploader/` files and the removed Serena-related files. Do not forget to
verify staged changes before committing.

## Next Agent
commit-message
