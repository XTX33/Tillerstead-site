# High-Visibility Contrast System

## Overview

The Tillerstead site now includes a **site-wide, high-visibility contrast system** that automatically adjusts text colors to meet WCAG AAA contrast requirements (7:1 ratio by default). The system uses CSS custom properties and the `color-mix()` function, combined with JavaScript that computes optimal foreground colors based on the actual background.

## Quick Start

### Apply to Body (Site-Wide)

To enable the contrast system for the entire site, add the `c-contrast` class to the `<body>` element:

```html
<body class="site-body c-contrast">
  <!-- All text will now automatically adjust for optimal contrast -->
</body>
```

### Apply to Specific Elements

You can also apply the class to individual containers or elements:

```html
<div class="gc-card c-contrast">
  <h3>This heading will have optimal contrast</h3>
  <p>This paragraph text will too.</p>
</div>
```

## How It Works

1. **CSS (`contrast.css`)**: Defines the `--contrast-target` custom property (default: 7) and the `.c-contrast` utility class that uses `color-mix()` to blend between black and white poles.

2. **JavaScript (`contrast.js`)**: On page load (and after theme changes):
   - Scans every element with the `.c-contrast` class
   - Reads the effective background color (walking up the DOM if needed)
   - Computes WCAG contrast ratios for pure black and pure white
   - Chooses the pole (black or white) that reaches the target ratio with the smallest mix percentage
   - Sets `--mix-pole` and `--mix-perc` CSS variables on the element

3. **Integration**: The system automatically re-runs when the theme changes (light/dark mode toggle).

## Adjusting Contrast Level

### Globally Change Target Ratio

You can change the global contrast target by updating the `--contrast-target` CSS variable:

```css
:root {
  --contrast-target: 4.5; /* WCAG AA */
}
```

Or set it in JavaScript:

```javascript
document.documentElement.style.setProperty('--contrast-target', '4.5');
window.applyContrast(4.5);
```

### Manually Trigger Recalculation

After dynamic content changes or theme updates, you can manually recalculate contrast:

```javascript
// Use the global default target (7)
window.applyContrast();

// Or specify a custom target ratio
window.applyContrast(4.5);
```

## Fallback Levels

For browsers that don't support `color-mix()`, the system includes discrete fallback classes:

```html
<div class="c-contrast c-lvl-7">
  <!-- Falls back to 90% opacity black if color-mix() is unavailable -->
</div>
```

Available levels: `.c-lvl-1` through `.c-lvl-10` (10%, 20%, 35%, 50%, 65%, 80%, 90%, 95%, 98%, 100%)

For light backgrounds, combine with `.c-light`:

```html
<div class="c-contrast c-light c-lvl-7">
  <!-- Uses white color instead of black -->
</div>
```

## WCAG Contrast Ratios

- **AAA (Enhanced)**: 7:1 for normal text, 4.5:1 for large text (default)
- **AA (Minimum)**: 4.5:1 for normal text, 3:1 for large text

## Browser Support

- Modern browsers with `color-mix()` support: Chrome 111+, Firefox 113+, Safari 16.2+
- Fallback classes work in all browsers
- JavaScript uses standard DOM APIs (ES2015+)

## Examples

### High-Visibility Hero Section

```html
<section class="hero c-contrast">
  <h1>Property Maintenance & Remodeling</h1>
  <p>Reliable service across South Jersey</p>
</section>
```

### Cards with Different Backgrounds

```html
<div class="gc-kpis">
  <div class="gc-kpi c-contrast">
    <span class="gc-kpi-label">Service Area</span>
    <p>Atlantic County and South Jersey shore</p>
  </div>
  <div class="gc-kpi c-contrast">
    <span class="gc-kpi-label">License</span>
    <p>NJ HIC #13VH12345600</p>
  </div>
</div>
```

### Dynamic Content

```javascript
// Add content dynamically
const card = document.createElement('div');
card.className = 'card c-contrast';
card.innerHTML = '<p>New content with automatic contrast</p>';
document.body.appendChild(card);

// Recalculate contrast for new elements
window.applyContrast();
```

## Implementation Details

The system is integrated in:
- **CSS**: `/assets/css/contrast.css` (imported in `_includes/head.html`)
- **JavaScript**: `/assets/js/contrast.js` (loaded in `_includes/scripts.html`)
- **Integration**: Theme toggle in `main.js` calls `window.applyContrast()` automatically

## Performance

The contrast calculation is efficient and runs only on elements with the `.c-contrast` class. The system uses:
- Binary search for optimal mix percentage (O(log n))
- Single DOM traversal for background color detection
- CSS variables for instant visual updates
- Automatic recalculation on theme changes

## Accessibility Benefits

✓ WCAG AAA compliance (7:1 contrast ratio)  
✓ Works with any background color  
✓ Adapts to light/dark theme changes  
✓ No manual color selection needed  
✓ Consistent readability across the site
