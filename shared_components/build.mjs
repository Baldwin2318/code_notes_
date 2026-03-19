import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformFileSync } from '@babel/core';
import presetReact from '@babel/preset-react';
import babelPluginMacros from 'babel-plugin-macros';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

fs.mkdirSync(distDir, { recursive: true });

for (const entry of fs.readdirSync(srcDir)) {
  const inputPath = path.join(srcDir, entry);
  const outputPath = path.join(distDir, entry.replace(/\.jsx$/, '.js'));

  if (entry.endsWith('.jsx')) {
    const result = transformFileSync(inputPath, {
      presets: [[presetReact, { runtime: 'automatic' }]],
      plugins: [babelPluginMacros],
      babelrc: false,
      configFile: false,
      sourceMaps: false
    });

    const outputCode = (result?.code || '').replaceAll(
      '"__SHARED_COMPONENTS_VERSION__"',
      JSON.stringify(packageJson.version || '1.0.0')
    );

    fs.writeFileSync(outputPath, outputCode, 'utf8');
    continue;
  }

  fs.copyFileSync(inputPath, outputPath);
}
