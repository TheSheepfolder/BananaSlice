import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(__dirname, '..');

const pkgPath = path.resolve(rootPath, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

console.log(`Syncing files to version ${version}...`);

// 1. src-tauri/tauri.conf.json
const tauriConfPath = path.resolve(rootPath, 'src-tauri/tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
    tauriConf.version = version;
    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
    console.log('✓ Updated tauri.conf.json');
}

// 2. src-tauri/Cargo.toml
const cargoPath = path.resolve(rootPath, 'src-tauri/Cargo.toml');
if (fs.existsSync(cargoPath)) {
    let cargo = fs.readFileSync(cargoPath, 'utf8');
    cargo = cargo.replace(/^version = ".*"/m, `version = "${version}"`);
    fs.writeFileSync(cargoPath, cargo);
    console.log('✓ Updated Cargo.toml');
}

// 3. src-tauri/Cargo.lock
const cargoLockPath = path.resolve(rootPath, 'src-tauri/Cargo.lock');
if (fs.existsSync(cargoLockPath)) {
    let cargoLock = fs.readFileSync(cargoLockPath, 'utf8');
    const regex = /(name = "bananaslice"\r?\nversion = ")[\d.]+/;
    if (regex.test(cargoLock)) {
        cargoLock = cargoLock.replace(regex, `$1${version}`);
        fs.writeFileSync(cargoLockPath, cargoLock);
        console.log('✓ Updated Cargo.lock');
    }
}

// 4. README.md
const readmePath = path.resolve(rootPath, 'README.md');
if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    // Update badge URL
    readme = readme.replace(/Version-([0-9.]+)-yellow/g, `Version-${version}-yellow`);
    // Update badge Alt text
    readme = readme.replace(/\[Version: ([0-9.]+)\]/g, `[Version: ${version}]`);
    fs.writeFileSync(readmePath, readme);
    console.log('✓ Updated README.md badges');
}

console.log('All files synced successfully!');
