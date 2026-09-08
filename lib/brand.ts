/**
 * Product brand.
 *
 * Single source for the wordmark, the document-title suffix, and the legal
 * line, so a rename touches this file rather than every page's metadata.
 * `navByPortal` in `lib/navigation.ts` reads `BRAND.name` for the sidebar
 * wordmark; the root layout reads the rest for `<title>` and meta tags.
 */

export const BRAND = {
  /** Wordmark. Rendered uppercase; kept uppercase here so it reads the same in copy. */
  name: "NEXUS",
  /** Sits beside the wordmark in the default document title. */
  tagline: "School Management",
  description:
    "NEXUS school management — student records, finance, teaching resources, and results in one portal.",
  /** Footer legal line. */
  copyright: "© NEXUS. All rights reserved.",
} as const;

/**
 * Shared typography for the wordmark: bold, uppercase, wide tracking. Used by
 * the sidebar header and the sign-in pages so the mark is identical in both.
 */
export const WORDMARK_CLASS = "font-bold tracking-widest uppercase";
