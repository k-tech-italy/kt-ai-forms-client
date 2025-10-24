#!/usr/bin/env node

import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

// Get the destination folder from environment variable
const DEST_FOLDER = process.env.BUILD_DEST_FOLDER;

if (!DEST_FOLDER) {
  console.error('❌ Error: BUILD_DEST_FOLDER environment variable is not set');
  console.error('💡 Did you run "direnv allow"?');
  console.error('   Make sure BUILD_DEST_FOLDER is set in your .env file');
  process.exit(1);
}

let isBuilding = false;
let buildQueued = false;

async function buildAndMove() {
  if (isBuilding) {
    buildQueued = true;
    console.log('⏳ Build already in progress, queuing next build...');
    return;
  }

  isBuilding = true;
  console.log('\n🔨 Building project...');

  try {
    // Run the build command
    const { stdout, stderr } = await execAsync('npm run build');
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('✅ Build completed successfully!');

    // Copy specific files from dist/assets to destination folder
    const sourceDir = path.join(__dirname, 'dist', 'assets');
    const destDir = path.resolve(DEST_FOLDER);

    console.log(`📦 Copying files from ${sourceDir} to ${destDir}...`);

    // Create destination directory if it doesn't exist
    await fs.mkdir(destDir, { recursive: true });

    // Only copy aiagent.min.js and aiagent.min.css
    const filesToCopy = ['aiagent.min.js', 'aiagent.min.css'];

    for (const file of filesToCopy) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);

      try {
        await fs.copyFile(sourcePath, destPath);
        console.log(`  ✓ Copied ${file}`);
      } catch (error) {
        console.warn(`  ⚠ Could not copy ${file}: ${error.message}`);
      }
    }

    console.log('✨ Files copied successfully!');
    console.log('👀 Watching for changes...\n');

  } catch (error) {
    console.error('❌ Build or copy failed:', error.message);
  } finally {
    isBuilding = false;

    // If another build was queued, execute it now
    if (buildQueued) {
      buildQueued = false;
      setTimeout(() => buildAndMove(), 100);
    }
  }
}

// Watch the src directory
console.log('👀 Starting file watcher for src/ directory...');
console.log(`📂 Destination folder: ${DEST_FOLDER}\n`);

const watcher = chokidar.watch('src', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('change', (filepath) => {
    console.log(`📝 File changed: ${filepath}`);
    buildAndMove();
  })
  .on('add', (filepath) => {
    console.log(`➕ File added: ${filepath}`);
    buildAndMove();
  })
  .on('unlink', (filepath) => {
    console.log(`➖ File removed: ${filepath}`);
    buildAndMove();
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

console.log('✅ Watcher started successfully!');
console.log('👀 Watching for changes in src/ folder...\n');
