# OmarCMS Image Specifications

## Hero Images

**Dimensions:** 1200×630 pixels (aspect ratio ~1.9:1)

**Why these dimensions?**
- Matches Open Graph specification for social sharing (Facebook, Twitter, LinkedIn)
- Wide enough to be cinematic/engaging
- Not too tall (avoids excessive scrolling)
- Works well on mobile and desktop

**File format:** JPEG (smaller file size for photos)

**Max file size:** 500KB (keeps page load fast)

## Inline Images

**Max width:** 800 pixels

**Why 800px?**
- Readable on mobile (scales down nicely)
- Not overwhelming on desktop
- Fits within typical blog content width (42rem = ~672px, but allows for full-bleed)

**File format:** PNG (for screenshots/diagrams) or JPEG (for photos)

**Max file size:** 1MB per image

## Fallback/Default OG Image

**Path:** `public/images/default-og.jpg`

**Dimensions:** 1200×630 pixels

**Purpose:** Used when a post has no hero image (for social sharing)

---

**Created:** 2026-02-14
**Last Updated:** 2026-02-14
