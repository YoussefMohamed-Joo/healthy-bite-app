import { writeFileSync } from 'fs'

function createSvg(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2E7D32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B5E20;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">HealthyBite</text>
  <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#A5D6A7">وجبات صحية — بني سويف</text>
  <rect x="${width/2-80}" y="${height-100}" width="160" height="3" rx="1.5" fill="#A5D6A7" />
</svg>`
}

const svg = createSvg(1200, 630)
writeFileSync('client/public/og-image.svg', svg)
console.log('✅ Created client/public/og-image.svg')
