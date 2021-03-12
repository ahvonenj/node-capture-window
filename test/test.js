import { getRawWindowRect, getWindowRect } from '../index.js'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rawRect = getRawWindowRect('Untitled - Notepad\0');
console.log(rawRect)

const monitors = JSON.parse(fs.readFileSync(`${__dirname}/../ncw-config/monitors.json`, 'utf-8'));


let rect = getWindowRect('Untitled - Notepad\0', monitors);
console.log(rect)
