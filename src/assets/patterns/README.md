# Sacred Geometry Background Patterns

This directory contains the background pattern assets used throughout the Tillerstead site.

## Pattern Files

### `sacred-geometry-tile.svg`
- **Format**: SVG (Scalable Vector Graphics)
- **Dimensions**: 200×200px
- **Purpose**: Main editable vector source for the sacred geometry pattern
- **Design**: Flower of Life inspired hexagonal pattern with seamless tiling
- **Tiling**: Designed to repeat seamlessly in all directions

#### Design Elements:
- **Hexagonal Structure**: Three concentric hexagons creating depth
- **Sacred Geometry**: Connecting lines forming triangular grid patterns
- **Focal Points**: Central glow and vertex markers for visual interest
- **Edge Transitions**: Subtle decorative elements ensuring seamless tiling
- **Corner Elements**: Circular accents that align across tile boundaries

#### Colors:
- Primary structure: `#8fa4c4` (muted blue-gray)
- Accent lines: `#38bdf8` (cyan-blue)
- Focal points: `#1ec98e` (brand primary green)
- Highlights: `#f8fafc` (near-white)
- Grid: `#94a3b8` (slate-gray)

### `sacred-geometry-tile.webp`
- **Format**: WebP (Modern web format)
- **Purpose**: Optimized version for modern browsers
- **Benefits**: ~30% smaller file size than PNG with same quality
- **Support**: All modern browsers (Chrome, Firefox, Safari 14+, Edge)

### `sacred-geometry-tile.png`
- **Format**: PNG (Portable Network Graphics)
- **Purpose**: Fallback for older browsers or contexts requiring PNG
- **Use Case**: Email clients, legacy browser support, print assets

## Usage

### In CSS
```css
/* Modern browsers with WebP support */
.hero-surface::before {
  background-image: url("../../src/assets/patterns/sacred-geometry-tile.webp");
  background-repeat: repeat;
  background-size: 200px 200px;
}

/* Fallback for older browsers */
@supports not (background-image: url("file.webp")) {
  .hero-surface::before {
    background-image: url("../../src/assets/patterns/sacred-geometry-tile.png");
  }
}
```

### Via CSS Custom Properties
```css
:root {
  --bg-pattern: url("../../src/assets/patterns/sacred-geometry-tile.webp");
}

html.light {
  --bg-pattern: url("../../src/assets/patterns/sacred-geometry-tile.webp");
}
```

## Updating the Pattern

### Editing the SVG
1. Open `sacred-geometry-tile.svg` in your preferred vector editor (Figma, Illustrator, Inkscape, or text editor)
2. Modify the design while maintaining the 200×200px artboard
3. **Important**: Keep edge elements aligned to ensure seamless tiling
4. Test tiling by viewing the pattern repeated in a browser

### Regenerating Raster Formats

After updating the SVG, regenerate the WebP and PNG versions:

#### Using ImageMagick (CLI):
```bash
# Generate PNG (if you need to update it)
convert sacred-geometry-tile.svg -resize 200x200 sacred-geometry-tile.png

# Generate WebP
convert sacred-geometry-tile.png -quality 85 sacred-geometry-tile.webp
```

#### Using Node.js (sharp):
```bash
npm install sharp sharp-cli
npx sharp -i sacred-geometry-tile.svg -o sacred-geometry-tile.png --resize 200 200
npx sharp -i sacred-geometry-tile.png -o sacred-geometry-tile.webp --webp
```

#### Using Online Tools:
- SVG to PNG: [CloudConvert](https://cloudconvert.com/svg-to-png)
- PNG to WebP: [Squoosh](https://squoosh.app/)

### Testing Seamless Tiling

Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background-image: url('sacred-geometry-tile.webp');
      background-repeat: repeat;
      background-size: 200px 200px;
    }
  </style>
</head>
<body></body>
</html>
```

Look for:
- ✅ No visible seams at tile boundaries
- ✅ Pattern flows naturally when repeated
- ✅ Corner elements align correctly
- ✅ Edge transitions are smooth

## Pattern Variants

To create theme variants (e.g., for light mode):

1. **Adjust opacity** in CSS rather than creating new files:
   ```css
   html.light .hero-surface::before {
     opacity: 0.4; /* Reduced for light backgrounds */
   }
   ```

2. **Use CSS filters** for color shifts:
   ```css
   html.light .hero-surface::before {
     filter: brightness(1.2) saturate(0.8);
   }
   ```

## Browser Support

| Browser | WebP | PNG | SVG |
|---------|------|-----|-----|
| Chrome 32+ | ✅ | ✅ | ✅ |
| Firefox 65+ | ✅ | ✅ | ✅ |
| Safari 14+ | ✅ | ✅ | ✅ |
| Edge 18+ | ✅ | ✅ | ✅ |
| IE 11 | ❌ | ✅ | ⚠️ |

## Performance Notes

- **SVG**: Best for editing, but can be larger for complex patterns
- **WebP**: ~30% smaller than PNG, use as primary format
- **PNG**: Reliable fallback, good browser support
- **Lazy Loading**: Consider lazy-loading background patterns for hero sections

## License

These patterns are proprietary to Tillerstead LLC and part of the brand identity.
