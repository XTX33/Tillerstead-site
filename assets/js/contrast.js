// assets/js/contrast.js
// Global auto-contrast for all text inside body.ts-page

(function () {
  function parseColorToRGB(color) {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = color;
    const computed = ctx.fillStyle;

    const div = document.createElement('div');
    div.style.color = computed;
    document.body.appendChild(div);
    const rgb = getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return null;
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10)
    };
  }

  function relativeLuminance(rgb) {
    const srgb = ['r', 'g', 'b'].map((ch) => {
      let v = rgb[ch] / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  function contrastRatio(rgb1, rgb2) {
    const L1 = relativeLuminance(rgb1);
    const L2 = relativeLuminance(rgb2);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function resolveBackgroundColor(el) {
    let node = el;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      const bg = style.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      node = node.parentElement;
    }
    // Fallback to body bg
    return getComputedStyle(document.body).backgroundColor;
  }

  function applyContrastOnce(targetRatio) {
    const rootStyle = getComputedStyle(document.documentElement);

    const poleDarkColor =
      rootStyle.getPropertyValue('--ts-color-text-on-light').trim() || '#020617';
    const poleLightColor =
      rootStyle.getPropertyValue('--ts-color-text-on-dark').trim() || '#f9fafb';

    const poleDarkRGB = parseColorToRGB(poleDarkColor);
    const poleLightRGB = parseColorToRGB(poleLightColor);

    if (!poleDarkRGB || !poleLightRGB) return;

    const container = document.querySelector('body.ts-page');
    if (!container) return;

    // Select ALL elements that could contain visible text,
    // but skip obvious non-text / utility nodes.
    const els = container.querySelectorAll(
      '*:not(.no-contrast):not(script):not(style):not(noscript):not(svg):not(path):not(title):not(meta):not(link)'
    );

    els.forEach((el) => {
      const bgColor = resolveBackgroundColor(el);
      const bgRGB = parseColorToRGB(bgColor);
      if (!bgRGB) return;

      const contrastWithDark = contrastRatio(poleDarkRGB, bgRGB);
      const contrastWithLight = contrastRatio(poleLightRGB, bgRGB);

      let chosenColor = poleLightColor;
      let chosenContrast = contrastWithLight;

      if (contrastWithDark > contrastWithLight) {
        chosenColor = poleDarkColor;
        chosenContrast = contrastWithDark;
      }

      // If chosenContrast < targetRatio, we still set the best we have.
      // You can log or debug these if needed.
      el.style.setProperty('--c-contrast-color', chosenColor);
    });
  }

  window.applyContrast = function (target) {
    const rootStyle = getComputedStyle(document.documentElement);
    const defaultTarget =
      parseFloat(rootStyle.getPropertyValue('--contrast-target')) || 7;
    applyContrastOnce(target || defaultTarget);
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.applyContrast();
    });
  } else {
    window.applyContrast();
  }

  // Observe DOM changes and re-apply for new content
  const observer = new MutationObserver(function (mutations) {
    let shouldRecalc = false;
    mutations.forEach((m) => {
      if (m.addedNodes && m.addedNodes.length > 0) {
        shouldRecalc = true;
      }
    });
    if (shouldRecalc) {
      window.applyContrast();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();