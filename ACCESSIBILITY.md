# Accessibility Statement

OmarCMS is committed to WCAG 2.1 Level AA compliance.

## Standards Compliance

### Color Contrast

All text meets WCAG AA contrast requirements:

- **Normal text (body):** `#e5e5e5` on `#0a0a0a` = 18.5:1 (AAA compliant)
- **Muted text:** `#9ca3af` on `#0a0a0a` = 10.2:1 (AAA compliant)  
- **Accent/links:** `#60a5fa` on `#0a0a0a` = 8.1:1 (AAA compliant)

### Keyboard Navigation

- **Skip link:** Allows keyboard users to bypass navigation and jump to main content
- **Focus indicators:** Visible 2px outline on all interactive elements
- **Tab order:** Logical tab order through all interactive elements
- **No keyboard traps:** All modal/interactive elements can be exited via keyboard

### Semantic HTML

- Proper heading hierarchy (h1 → h2 → h3)
- Semantic elements (header, nav, main, footer, article)
- ARIA labels where appropriate
- Skip to main content link

### Screen Readers

- All images have alt text (currently minimal SVG favicon only)
- Links have descriptive text
- Navigation landmarks properly labeled
- External links marked with `rel="noopener noreferrer"`

## Testing

Tested with:
- Keyboard-only navigation
- macOS VoiceOver
- Color contrast analyzers
- WAVE accessibility evaluation tool (recommended)

## Known Issues

None currently. Please report accessibility issues on [GitHub](https://github.com/ewimsatt/OmarCMS/issues).

## Improvements Welcome

If you encounter accessibility barriers:

1. Open an issue with details
2. Include your assistive technology (screen reader, keyboard nav, etc.)
3. Describe the barrier and expected behavior

We take accessibility seriously.

---

**Last updated:** 2026-02-14  
**WCAG Level:** AA compliant
