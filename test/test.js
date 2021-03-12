import { getRawWindowRect, getWindowRect, grabWindowImage } from '../index.js'
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import jimp from 'jimp'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WINDOW_TITLE = '*Untitled - Notepad\0';

let rawRect = getRawWindowRect(WINDOW_TITLE);
console.log(rawRect)

const monitors = JSON.parse(fs.readFileSync(`${__dirname}/../ncw-config/monitors.json`, 'utf-8'));

let rect = getWindowRect(WINDOW_TITLE, monitors);
console.log(rect)

let bitmap = grabWindowImage(WINDOW_TITLE, monitors);

const image = new jimp(bitmap.width, bitmap.height);

let pos = 0;
image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => 
{
	image.bitmap.data[idx + 2] = bitmap.image.readUInt8(pos++);
	image.bitmap.data[idx + 1] = bitmap.image.readUInt8(pos++);
	image.bitmap.data[idx + 0] = bitmap.image.readUInt8(pos++);
	image.bitmap.data[idx + 3] = bitmap.image.readUInt8(pos++);
});

image.write(`${__dirname}/image.png`);