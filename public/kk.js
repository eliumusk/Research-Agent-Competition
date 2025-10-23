import fs from 'fs';
import pngToIco from 'png-to-ico';
// generate-icons.js
import sharp from 'sharp';

const inputFile = 'logo.png'; // 原始 logo 文件路径
const outputDir = 'public'; // 输出目录（可改）

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🖼️  Generating PNG icons...');

  const pngPaths = [];

  for (const { name, size } of sizes) {
    const outputPath = `${outputDir}/${name}`;
    await sharp(inputFile).resize(size, size).toFile(outputPath);
    pngPaths.push(outputPath);
    console.log(`✅ Created ${name}`);
  }

  console.log('🎨  Generating favicon.ico...');
  const buffer = await pngToIco(pngPaths);
  fs.writeFileSync(`${outputDir}/favicon.ico`, buffer);
  console.log('✅ Created favicon.ico');

  console.log('✨ All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('❌ Error generating icons:', err);
});
