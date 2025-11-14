/* contrast.js — Tillerstead High-Visibility Contrast System
   Automatically calculates and applies optimal text colors for WCAG compliance
   
   Features:
   - Scans elements with .c-contrast class
   - Computes contrast against background color
   - Chooses optimal pole (black/white) and mix percentage
   - Updates CSS variables for color-mix() function
   - Supports dynamic theme changes
*/

(() => {
  "use strict";

  /**
   * Calculate relative luminance of an RGB color
   * @param {number} r - Red channel (0-255)
   * @param {number} g - Green channel (0-255)
   * @param {number} b - Blue channel (0-255)
   * @returns {number} Relative luminance (0-1)
   */
  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const srgb = c / 255;
      return srgb <= 0.03928
        ? srgb / 12.92
        : Math.pow((srgb + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate WCAG contrast ratio between two colors
   * @param {number} l1 - Luminance of first color
   * @param {number} l2 - Luminance of second color
   * @returns {number} Contrast ratio (1-21)
   */
  function getContrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse RGB color string to [r, g, b] array
   * @param {string} color - RGB/RGBA color string
   * @returns {number[]} [r, g, b] array
   */
  function parseRGB(color) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return [0, 0, 0];
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }

  /**
   * Get the effective background color of an element
   * Walks up the DOM tree until a non-transparent background is found
   * @param {Element} el - Element to check
   * @returns {string} RGB color string
   */
  function getEffectiveBackground(el) {
    let current = el;
    while (current && current !== document.documentElement) {
      const bg = window.getComputedStyle(current).backgroundColor;
      // Check if background is not transparent
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        return bg;
      }
      current = current.parentElement;
    }
    // Default to root background or black
    const rootBg = window.getComputedStyle(
      document.documentElement,
    ).backgroundColor;
    return rootBg && rootBg !== "transparent" ? rootBg : "rgb(0, 0, 0)";
  }

  /**
   * Find the minimum mix percentage needed to achieve target contrast
   * @param {number} bgLum - Background luminance
   * @param {number} poleLum - Pole luminance (0 for black, 1 for white)
   * @param {number} targetRatio - Target WCAG contrast ratio
   * @returns {number} Mix percentage (0-100)
   */
  function findMixPercentage(bgLum, poleLum, targetRatio) {
    // Binary search for the minimum percentage
    let low = 0;
    let high = 100;
    let result = 100;

    while (high - low > 0.1) {
      const mid = (low + high) / 2;
      const mixedLum = bgLum + (poleLum - bgLum) * (mid / 100);
      const ratio = getContrastRatio(bgLum, mixedLum);

      if (ratio >= targetRatio) {
        result = mid;
        high = mid;
      } else {
        low = mid;
      }
    }

    return Math.ceil(result);
  }

  /**
   * Apply contrast adjustments to an element
   * @param {Element} el - Element with .c-contrast class
   * @param {number} targetRatio - Target WCAG contrast ratio
   */
  function applyContrastToElement(el, targetRatio) {
    const bgColor = getEffectiveBackground(el);
    const [r, g, b] = parseRGB(bgColor);
    const bgLum = getLuminance(r, g, b);

    const blackLum = 0;
    const whiteLum = 1;

    // Calculate contrast ratios for pure black and pure white
    const blackRatio = getContrastRatio(bgLum, blackLum);
    const whiteRatio = getContrastRatio(bgLum, whiteLum);

    // Choose the pole that can reach target with less mixing
    let pole, poleLum;
    if (blackRatio >= targetRatio && whiteRatio >= targetRatio) {
      // Both work, prefer the one that needs less mixing
      pole = blackRatio > whiteRatio ? "black" : "white";
      poleLum = pole === "black" ? blackLum : whiteLum;
    } else if (blackRatio >= targetRatio) {
      pole = "black";
      poleLum = blackLum;
    } else if (whiteRatio >= targetRatio) {
      pole = "white";
      poleLum = whiteLum;
    } else {
      // Neither pure color reaches target, use the better one at 100%
      pole = blackRatio > whiteRatio ? "black" : "white";
      poleLum = pole === "black" ? blackLum : whiteLum;
    }

    // Find minimum mix percentage to achieve target
    const mixPerc = findMixPercentage(bgLum, poleLum, targetRatio);

    // Set CSS variables
    el.style.setProperty("--mix-pole", pole);
    el.style.setProperty("--mix-perc", `${mixPerc}%`);
  }

  /**
   * Apply contrast adjustments to all elements with .c-contrast class
   * @param {number} targetRatio - Target WCAG contrast ratio (default: 7 for AAA)
   */
  function applyContrast(targetRatio = 7) {
    // Update the global CSS variable
    document.documentElement.style.setProperty(
      "--contrast-target",
      targetRatio,
    );

    // Find all elements with .c-contrast class
    const elements = document.querySelectorAll(".c-contrast");
    elements.forEach((el) => {
      applyContrastToElement(el, targetRatio);
    });
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyContrast());
  } else {
    applyContrast();
  }

  // Expose function globally for manual calls (e.g., after theme toggle)
  window.applyContrast = applyContrast;
})();
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
