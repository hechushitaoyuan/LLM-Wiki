/**
 * 图片优化脚本
 * 读取 public/images/full/ 下的所有 PNG，生成 WebP 缩略图到 public/images/thumb/
 * 缩略图：宽 800px，质量 82，适合网页列表展示
 * 原图保留在 full/ 供点击放大查看
 *
 * 用法：
 *   npm install sharp
 *   node optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, 'public', 'images', 'full');
const OUT_DIR = join(__dirname, 'public', 'images', 'thumb');

const THUMB_WIDTH = 800;       // 缩略图宽度
const QUALITY = 82;            // WebP 质量

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR))
    .filter(f => /\.png$/i.test(extname(f)));

  console.log(`找到 ${files.length} 张图片，开始生成 WebP 缩略图…\n`);

  let totalOrig = 0;
  let totalThumb = 0;

  for (const file of files) {
    const src = join(SRC_DIR, file);
    const outName = file.replace(/\.png$/i, '.webp');
    const out = join(OUT_DIR, outName);

    const srcStat = await sharp(src)
      .metadata()
      .then(() => import('node:fs/promises'))
      .then(fs => fs.stat(src));

    await sharp(src)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);

    const outStat = await import('node:fs/promises').then(fs => fs.stat(out));
    const origKB = (srcStat.size / 1024).toFixed(0);
    const thumbKB = (outStat.size / 1024).toFixed(0);
    const ratio = ((1 - outStat.size / srcStat.size) * 100).toFixed(0);

    totalOrig += srcStat.size;
    totalThumb += outStat.size;

    console.log(`  ${file.padEnd(40)} ${origKB}KB → ${thumbKB}KB  (-${ratio}%)`);
  }

  console.log(`\n完成！共 ${files.length} 张`);
  console.log(`原始总计：${(totalOrig / 1024 / 1024).toFixed(1)} MB`);
  console.log(`缩略图总计：${(totalThumb / 1024 / 1024).toFixed(1)} MB`);
  console.log(`节省：${((1 - totalThumb / totalOrig) * 100).toFixed(0)}%`);
}

main().catch(err => {
  console.error('优化失败：', err);
  process.exit(1);
});
