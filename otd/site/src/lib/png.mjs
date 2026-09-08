// Minimal PNG encoder (no dependency) for the cover fallback: a flat colour
// block with the date bitmap-printed on it, used only until real covers land
// at otd/out/cover/MM-DD.png.
import zlib from "node:zlib";

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** pixelFn(x, y) => [r, g, b] */
export function encodePNG(width, height, pixelFn) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter type 0, none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// 5x7 bitmap font: digits, dash, slash, space. Each glyph is 7 rows of a
// 5-bit-wide bitmask (MSB first, bit4..bit0 = columns left to right).
const FONT = {
  "0": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  "1": [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "2": [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  "3": [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  "4": [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  "5": [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  "6": [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  "7": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  "8": [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  "9": [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  "-": [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  "/": [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  " ": [0, 0, 0, 0, 0, 0, 0],
};

/** Draws text at integer pixel scale into an already-allocated pixel setter. */
export function drawBitmapText(setPixel, text, x0, y0, scale, rgb) {
  let x = x0;
  for (const ch of text) {
    const glyph = FONT[ch] || FONT[" "];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (glyph[row] & (1 << (4 - col))) {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              setPixel(x + col * scale + sx, y0 + row * scale + sy, rgb);
            }
          }
        }
      }
    }
    x += 6 * scale;
  }
  return x - x0;
}

/** A flat BLUE (#1A1AFF) cover block with the MM-DD date bitmap-printed on it. */
export function generatePlaceholderCover(mmdd, width = 270, height = 480) {
  const BLUE = [0x1a, 0x1a, 0xff];
  const YELLOW = [0xff, 0xe6, 0x00];
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 3] = BLUE[0];
    pixels[i * 3 + 1] = BLUE[1];
    pixels[i * 3 + 2] = BLUE[2];
  }
  const setPixel = (x, y, rgb) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = (y * width + x) * 3;
    pixels[i] = rgb[0];
    pixels[i + 1] = rgb[1];
    pixels[i + 2] = rgb[2];
  };
  const scale = Math.max(2, Math.round(width / 90));
  drawBitmapText(setPixel, mmdd, Math.round(width * 0.12), Math.round(height * 0.42), scale, YELLOW);
  return encodePNG(width, height, (x, y) => {
    const i = (y * width + x) * 3;
    return [pixels[i], pixels[i + 1], pixels[i + 2]];
  });
}
