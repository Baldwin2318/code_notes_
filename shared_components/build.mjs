import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformFileSync } from '@babel/core';
import presetReact from '@babel/preset-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

fs.mkdirSync(distDir, { recursive: true });

for (const entry of fs.readdirSync(srcDir)) {
  const inputPath = path.join(srcDir, entry);
  const outputPath = path.join(distDir, entry.replace(/\.jsx$/, '.js'));

  if (entry.endsWith('.jsx')) {
    const result = transformFileSync(inputPath, {
      presets: [[presetReact, { runtime: 'automatic' }]],
      babelrc: false,
      configFile: false,
      sourceMaps: false
    });

    fs.writeFileSync(outputPath, result?.code || '', 'utf8');
    continue;
  }

  fs.copyFileSync(inputPath, outputPath);
}
