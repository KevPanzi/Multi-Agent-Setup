# Workflow State

## Request
Update the existing image-uploader to also accept PDF files. PDFs should be displayed inline at the bottom of the page using the browser's native PDF viewer.

## Clarified Scope
- Extend accepted formats to include PDF (in addition to jpg and png)
- PDF displayed inline via `<embed src={previewUrl} type="application/pdf">` (browser native viewer)
- Images continue to display via `<img>`
- All other behaviour unchanged: click + drag/drop upload, 5MB max, error messages, invalid upload preserves last valid preview, new upload overwrites previous, object URL cleanup, input reset, keyboard accessible

## Open Questions
- None

## Constraints
- Max file size: 5MB (unchanged)
- Accepted formats: jpg, png, pdf
- Client-side only — no server/API routes
- No external styling libraries
- Plain CSS in `app/globals.css`

## Acceptance Criteria
1. User can upload jpg, png, or pdf via click or drag & drop
2. File is validated: must be jpg/png/pdf and ≤ 5MB
3. If invalid, a clear error message is shown; existing valid preview is preserved
4. If valid image (jpg/png), an `<img>` is rendered at the bottom of the page
5. If valid PDF, an `<embed>` with `type="application/pdf"` is rendered at the bottom of the page
6. The upload zone subtext is updated to reflect "JPG, PNG or PDF, up to 5MB"
7. Uploading a new valid file replaces the previous preview (image or PDF)
8. Error messages are cleared when a new valid file is selected
9. Previous `URL.createObjectURL()` is revoked on replace and unmount
10. File input is reset after each selection so the same file can be re-selected
11. Upload zone remains keyboard-accessible

## Plan
1. Update `image-uploader/app/page.tsx`:
   - Add `"application/pdf"` to `ALLOWED_MIME_TYPES`
   - Add `"pdf"` to `ALLOWED_EXTENSIONS`
   - Replace separate `previewUrl` + `fileType` states with a single `preview: { url: string; kind: "image" | "pdf" } | null` state to avoid inconsistent UI state
   - Update `handleFile` to set `preview` with both url and kind derived from `file.type`
   - Update `accept` attribute on `<input>` to `".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"`
   - Update upload zone subtext to "JPG, PNG or PDF, up to 5MB"
   - Update invalid file-type error text to include PDF: "Invalid file type. Please upload a JPG, PNG or PDF."
   - In the preview section: render `<img>` when `preview.kind === "image"`, render `<embed title="PDF preview" type="application/pdf">` when `preview.kind === "pdf"`
   - Object URL revoke logic targets `preview.url` (unchanged behaviour)
2. Update `image-uploader/app/globals.css`:
   - Add `.previewEmbed` styles: `width: 100%`, `height: 600px`, `border: none`

## Debate Notes
- Debater verdict: revise before implementation
- Accepted all debater suggestions:
  - Update error text to include PDF
  - Use single `preview: { url, kind } | null` state instead of two separate states
  - Add both MIME types and extensions to `accept` attribute
  - Add `title` to `<embed>` for accessibility + explicit height in CSS Verdict: revise before implementation.
- Context7 Next.js docs confirm browser-only APIs, state, and event handlers belong in Client Components; `app/page.tsx` already has `"use client"`, so no server/API route change is needed.
- Current plan is mostly sound but misses updating the invalid file-type error text from "JPG or PNG" to include PDF.
- Prefer a single preview state object, e.g. `{ url, kind: "image" | "pdf" }`, instead of separate `previewUrl` and `fileType` states to avoid inconsistent UI state.
- Add `.pdf` (and existing extensions) to the file input `accept` string as well as MIME types for better file picker compatibility: `.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf`.
- PDF embed caveat: browser native PDF rendering is browser/device dependent; implement `<embed type="application/pdf">` per scope, but do not assume every browser displays pages inline. Add a `title`/nearby accessible label and style with an explicit usable height.
- Keep existing behavior: invalid uploads preserve prior preview and object URLs are revoked only on valid replacement/unmount.

## Files To Change
- `image-uploader/app/page.tsx` — add PDF MIME/extension support, unified preview state, mixed image/PDF preview rendering
- `image-uploader/app/globals.css` — add styles for PDF embed element

## Implementation Notes
- Context7 (`/vercel/next.js`) confirmed this uploader logic should remain in a Client Component using `"use client"` for state/effects and browser APIs; no server/API changes needed.
- Updated `image-uploader/app/page.tsx`:
  - Added `application/pdf` to `ALLOWED_MIME_TYPES` and `pdf` to `ALLOWED_EXTENSIONS`.
  - Replaced `previewUrl` with `preview: { url: string; kind: "image" | "pdf" } | null`.
  - On valid file upload, derive `kind` from MIME type (`application/pdf` => `pdf`, otherwise `image`) and store alongside object URL.
  - Updated invalid-type error message to: `Invalid file type. Please upload a JPG, PNG or PDF.`
  - Updated `<input accept>` to include both extensions and MIME types: `.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf`.
  - Updated upload subtext to: `JPG, PNG or PDF, up to 5MB`.
  - Preview rendering now conditionally uses:
    - `<img>` for `preview.kind === "image"`
    - `<embed className="previewEmbed" title="PDF preview" type="application/pdf">` for `preview.kind === "pdf"`
  - Kept existing behavior for preserving prior valid preview on invalid upload, object URL revocation on replacement/unmount, and input reset after selection/drop.
- Updated `image-uploader/app/globals.css` with `.previewEmbed { width: 100%; height: 600px; border: none; }`.

## Review Findings
- Verdict: approved
- Checked `image-uploader/app/page.tsx` and `image-uploader/app/globals.css` against scope, acceptance criteria, and plan.
- Acceptance criteria met:
  - PDF added to allowed MIME types/extensions and file input `accept` list.
  - Single preview state object implemented as `preview: { url, kind } | null`.
  - Valid images render with `<img>`; valid PDFs render with `<embed type="application/pdf">`.
  - `<embed>` includes `title="PDF preview"`.
  - Upload subtext updated to `JPG, PNG or PDF, up to 5MB`.
  - Invalid type error text now mentions PDF.
  - Invalid uploads preserve prior preview; valid uploads replace prior preview and clear errors.
  - Object URL cleanup still works on replacement and unmount via `previousUrlRef` + `useEffect` cleanup.
  - Input reset remains in both change and drop handlers; keyboard accessibility remains unchanged.
- Verification:
  - `npm run build` in `image-uploader/` — PASS.
- Context7 check: Next.js App Router docs (`/vercel/next.js/v16.2.2`) support this browser-API/event-handler/effect-cleanup usage in a Client Component.

## Test Results
- `npm run build` (image-uploader/) — ✅ PASSED
  - Next.js 16.2.7 (Turbopack), compiled in 1683ms, TypeScript clean
- `npx tsc --noEmit` (image-uploader/) — ✅ PASSED (no output, zero type errors)

## Security Findings
Security review passed — no new issues introduced by PDF addition.

- Hardcoded secrets: None.
- XSS via blob URL for PDF: `URL.createObjectURL()` produces a `blob:` URL used in `<embed src>`. Browser renders PDF natively in its sandbox. No script execution path.
- MIME type bypass (Low, unchanged): `file.type` is browser-reported. Same acceptable risk as before — client-side preview only, no server processing, worst case is failed render.
- `<embed>` security: blob URL in `<embed type="application/pdf">` is browser-sandboxed. No additional risk vs `<img>`.
- Error messages remain hardcoded strings. No XSS vector.
- No new server-side code or API routes introduced.

## Lint Results
- `npx tsc --noEmit` (image-uploader/) — ✅ PASSED (zero type errors)
- `npm run build` — ✅ PASSED (TypeScript + compile clean)
- No ESLint configured (project scaffolded with `--no-eslint`)

## Commit Message Draft
feat(image-uploader): add PDF support with inline browser preview

- Accept PDFs (application/pdf and .pdf) and update input `accept` + validation; invalid-type error now mentions PDF.
- Use a unified preview state `{ url, kind }` and render images with `<img>` or PDFs with `<embed type="application/pdf">`; add `.previewEmbed` styles.
- Preserve existing behaviours: 5MB limit, object URL cleanup on replace/unmount, input reset, drag/drop and keyboard accessibility.
-

## Current Status
Phase 10 - Commit message drafted. Ready to commit. Handing off to developer to stage & commit changes.

## Next Agent
commit-message
