const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 32, 48, 128];
const color = '#E30613'; // SIT Connect Red

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background (Dark)
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Draw simple infinity symbol approximation for the icon
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const w = size;
  const h = size;
  
  ctx.beginPath();
  // Left loop
  ctx.arc(w * 0.3, h * 0.5, w * 0.15, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  // Right loop
  ctx.arc(w * 0.7, h * 0.5, w * 0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`chrome-extension/icons/icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
});
