
'use client';

// Simple hash function to get a number from a string
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Function to generate a color from a string
function getColor(str: string): string {
    const hash = simpleHash(str);
    const hue = Math.abs(hash) % 360;
    // Using fixed saturation and lightness for a consistent color palette
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Generates a unique, colorful SVG avatar from a string (e.g., a username).
 * @param name The string to generate the avatar from.
 * @returns A data URI for the generated SVG image.
 */
export function generateAvatar(name: string): string {
  const color1 = getColor(name);
  const color2 = getColor(name.split('').reverse().join(''));
  
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad)" />
      <text
        x="50%"
        y="55%"
        font-family="Arial, sans-serif"
        font-size="50"
        fill="#fff"
        text-anchor="middle"
        dominant-baseline="middle"
        font-weight="bold"
      >
        ${name.charAt(0).toUpperCase()}
      </text>
    </svg>
  `.replace(/\n/g, '').replace(/\s+/g, ' ');

  // Base64 encode the SVG
  const base64Svg = btoa(svg);

  return `data:image/svg+xml;base64,${base64Svg}`;
}
