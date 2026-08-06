# AI Job Portal Enhancement Plan

Focus areas: UI/UX polish, new features, and SEO/performance.

## UI/UX Polish

1. Replace full-page spinners with skeleton cards for job listings and guidance responses.
2. Add friendly empty states (no matches, no saved jobs) and a clear error-state illustration.
3. Improve page transitions and micro-interactions (hover lift, focus rings, button press).
4. Polish the mobile navigation with a sticky, accessible header.
5. Add a dark mode toggle that persists in `localStorage` and respects system preference.
6. Standardize spacing, card shadows, and typography across all routes.

## New Features

1. Save/bookmark jobs with a toggle on each job card; stored in `localStorage` for now.
2. Add a "Saved Jobs" page to view and remove bookmarked roles.
3. Show recent User ID searches on the Find Jobs page with one-click reuse.
4. Add job filters: location, remote/hybrid/onsite, and minimum skill match count.
5. Add sort options: relevance, newest, company name.
6. Add a "Copy User ID" button on the registration success toast for easier lookup.

## SEO / Performance

1. Complete `head()` metadata on every route: title, description, `og:*`, `twitter:*`, and canonical URLs.
2. Add a dynamic `sitemap.xml` server route and update `robots.txt`.
3. Preload the hero/LCP image on the home page.
4. Add client-side form validation with helpful inline error messages.
5. Lazy-load heavy route chunks where possible.

## Implementation Order

1. UI/UX skeletons and empty states (immediate visual improvement).
2. Saved jobs + recent searches (adds utility without backend changes).
3. Filters and sort on job results (improves discoverability).
4. SEO metadata and sitemap (prepares the site for indexing).
5. Dark mode toggle (nice-to-have polish).
