// gen.mjs — draws entry.png (1024x1024) for news-image-20261119.
// Pure Node stdlib only. Deterministic: no randomness, no dates, no I/O
// except writing entry.png next to this file.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;
const buf = Buffer.alloc(W * H * 3);

// ---- palette ----
const CREAM = [246, 241, 227];
const PAPER = [255, 253, 245];
const INK = [20, 20, 20];
const GREY = [90, 90, 86];
const RED = [178, 34, 34];
const BLUE = [31, 58, 95];
const GOLD = [176, 132, 30];

// ---- low-level raster ----
function px(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
}
function fillRect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) px(i, j, c);
}
function rect(x, y, w, h, c, t = 2) {
  fillRect(x, y, w, t, c); fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c); fillRect(x + w - t, y, t, h, c);
}
function line(x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, x = x0, y = y0;
  for (;;) {
    px(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}
function thickLine(x0, y0, x1, y1, c, t = 3) {
  for (let a = -Math.floor(t / 2); a <= Math.floor(t / 2); a++)
    line(x0 + a, y0, x1 + a, y1, c);
}
function circle(cx, cy, r, c) {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++)
      if (x * x + y * y <= r * r) px(cx + x, cy + y, c);
}
function ellipse(cx, cy, rx, ry, c) {
  for (let y = -ry; y <= ry; y++)
    for (let x = -rx; x <= rx; x++)
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) px(cx + x, cy + y, c);
}
function triangle(x0, y0, x1, y1, x2, y2, c) {
  const minX = Math.min(x0, x1, x2), maxX = Math.max(x0, x1, x2);
  const minY = Math.min(y0, y1, y2), maxY = Math.max(y0, y1, y2);
  const d = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const a = ((x1 - x) * (y2 - y) - (y1 - y) * (x2 - x)) / d;
      const b = ((x2 - x) * (y0 - y) - (y2 - y) * (x0 - x)) / d;
      const g = 1 - a - b;
      if (a >= 0 && b >= 0 && g >= 0) px(x, y, c);
    }
}
function polyline(points, c, t = 3) {
  for (let i = 0; i + 1 < points.length; i++)
    thickLine(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], c, t);
}

// ---- 5x7 bitmap font (rows are 5-bit values, MSB = left pixel) ----
const FONT = {
  A: [0x0e, 0x11, 0x11, 0x11, 0x1f, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  "0": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  "1": [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "2": [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  "3": [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  "4": [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  "5": [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  "6": [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  "7": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  "8": [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  "9": [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ",": [0, 0, 0, 0, 0x0c, 0x04, 0x08],
  "-": [0, 0, 0, 0x1f, 0, 0, 0],
  "%": [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
  "(": [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ")": [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  "!": [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  "?": [0x0e, 0x11, 0x01, 0x02, 0x04, 0, 0x04],
  "'": [0x04, 0x04, 0x08, 0, 0, 0, 0],
  "/": [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  "&": [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  "+": [0, 0x04, 0x04, 0x1f, 0x04, 0x04, 0],
  "=": [0, 0, 0x1f, 0, 0x1f, 0, 0],
  ":": [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],
  ";": [0, 0x0c, 0x0c, 0, 0x0c, 0x04, 0x08],
  '"': [0x0a, 0x0a, 0x0a, 0, 0, 0, 0],
};
function textWidth(s, scale) { return s.length * 6 * scale - scale; }
function drawText(x, y, s, scale, c) {
  const up = s.toUpperCase();
  for (let ci = 0; ci < up.length; ci++) {
    const g = FONT[up[ci]] || FONT[" "];
    for (let r = 0; r < 7; r++)
      for (let col = 0; col < 5; col++)
        if (g[r] & (1 << (4 - col)))
          fillRect(x + ci * 6 * scale + col * scale, y + r * scale, scale, scale, c);
  }
}
function drawTextCenter(cx, y, s, scale, c) {
  drawText(cx - Math.floor(textWidth(s, scale) / 2), y, s, scale, c);
}

// ---- PNG encoder (filter 0, zlib) ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG() {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    buf.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

// ---- art helpers ----
function star(cx, cy, r, c) {
  // 5-point star as 10 triangles from centre
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push([cx + Math.round(rr * Math.cos(a)), cy + Math.round(rr * Math.sin(a))]);
  }
  for (let i = 0; i < 10; i++)
    triangle(cx, cy, pts[i][0], pts[i][1], pts[(i + 1) % 10][0], pts[(i + 1) % 10][1], c);
}
function flagPole(x, yTop, yBot, c) { thickLine(x, yTop, x, yBot, c, 3); }
function wave(x, y, w, amp, c) {
  const pts = [];
  for (let i = 0; i <= w; i += 8)
    pts.push([x + i, y + Math.round(amp * Math.sin((i / w) * Math.PI * 4))]);
  polyline(pts, c, 2);
}

// ---- panel frame ----
function panel(x, y, w, h, headerColor, title) {
  fillRect(x, y, w, h, PAPER);
  fillRect(x, y, w, 38, headerColor);
  rect(x, y, w, h, INK, 2);
  drawText(x + 14, y + 12, title, 2, [255, 255, 255]);
  return { ax: x + 12, ay: y + 46, aw: w - 24, ah: 148 };
}
function captions(x, y, w, lines, startY) {
  lines.forEach((s, i) => drawTextCenter(x + Math.floor(w / 2), startY + i * 24, s, 2, INK));
}

// ---- background + header ----
fillRect(0, 0, W, H, CREAM);
drawTextCenter(512, 26, "19 NOVEMBER 2026", 6, INK);
drawTextCenter(512, 82, "WORLD NEWS IN ONE IMAGE", 3, GREY);
fillRect(24, 116, 976, 3, INK);
fillRect(24, 122, 976, 1, INK);

// ---- panel 1: Shenzhen summit (three flags) ----
{
  const p = panel(24, 150, 476, 296, BLUE, "SUMMIT IN SHENZHEN");
  const fy = p.ay + 6, fh = 62, fw = 104;
  const poles = [p.ax + 52, p.ax + 186, p.ax + 320];
  // USA flag
  flagPole(poles[0], fy, fy + fh + 42, INK);
  for (let s = 0; s < 7; s++)
    fillRect(poles[0] + 3, fy + s * 9, fw, 9, s % 2 === 0 ? [178, 34, 34] : [255, 255, 255]);
  fillRect(poles[0] + 3, fy, 44, 27, [31, 58, 95]);
  for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 4; c2++)
    px(poles[0] + 8 + c2 * 10, fy + 5 + r * 9, [255, 255, 255]);
  // China flag
  flagPole(poles[1], fy, fy + fh + 42, INK);
  fillRect(poles[1] + 3, fy, fw, fh, [222, 41, 16]);
  star(poles[1] + 22, fy + 18, 10, [255, 222, 0]);
  star(poles[1] + 52, fy + 10, 5, [255, 222, 0]);
  star(poles[1] + 62, fy + 24, 5, [255, 222, 0]);
  // Russia flag
  flagPole(poles[2], fy, fy + fh + 42, INK);
  fillRect(poles[2] + 3, fy, fw, 21, [255, 255, 255]);
  fillRect(poles[2] + 3, fy + 21, fw, 21, [0, 57, 166]);
  fillRect(poles[2] + 3, fy + 42, fw, 20, [213, 0, 50]);
  // round table + olive branch
  ellipse(p.ax + 226, p.ay + 128, 150, 16, [122, 82, 46]);
  fillRect(p.ax + 76, p.ay + 128, 300, 4, [90, 60, 30]);
  line(p.ax + 120, p.ay + 146, p.ax + 150, p.ay + 118, [46, 110, 46]);
  line(p.ax + 332, p.ay + 146, p.ax + 302, p.ay + 118, [46, 110, 46]);
  circle(p.ax + 138, p.ay + 132, 5, [46, 110, 46]);
  circle(p.ax + 314, p.ay + 132, 5, [46, 110, 46]);
  captions(24, 150, 476, ["TRUMP, XI AND PUTIN MEET", "JOINT PEACE DECLARATION SIGNED", "FIRST THREE-WAY SUMMIT OF ITS KIND"], 150 + 206);
}

// ---- panel 2: ICJ ruling (scales of justice) ----
{
  const p = panel(524, 150, 476, 296, [20, 82, 74], "ICJ: GENOCIDE VERDICT");
  const cx = p.ax + 226, top = p.ay + 8;
  thickLine(cx, top + 18, cx, top + 118, GOLD, 5);
  thickLine(cx - 110, top + 22, cx + 110, top + 22, GOLD, 5);
  circle(cx, top + 12, 7, GOLD);
  fillRect(cx - 34, top + 118, 68, 8, GOLD);
  fillRect(cx - 46, top + 126, 92, 8, GOLD);
  for (const side of [-1, 1]) {
    const px0 = cx + side * 110;
    line(px0, top + 22, px0 - 34, top + 66, GOLD);
    line(px0, top + 22, px0 + 34, top + 66, GOLD);
    triangle(px0 - 36, top + 66, px0 + 36, top + 66, px0, top + 96, GOLD);
  }
  // gavel
  fillRect(p.ax + 330, p.ay + 108, 74, 16, [122, 82, 46]);
  thickLine(p.ax + 356, p.ay + 124, p.ax + 392, p.ay + 148, [90, 60, 30], 5);
  captions(524, 150, 476, ["MYANMAR GUILTY OF GENOCIDE", "ROHINGYA CASE, 2017 CAMPAIGN", "FIRST SUCH RULING VS A STATE"], 150 + 206);
}

// ---- panel 3: tanker attacks (Strait of Hormuz) ----
{
  const p = panel(24, 456, 476, 296, [138, 47, 35], "TANKERS HIT IN HORMUZ");
  const seaY = p.ay + 118;
  fillRect(p.ax, seaY, p.aw, 30, [38, 110, 170]);
  wave(p.ax + 10, seaY + 10, p.aw - 20, 4, [255, 255, 255]);
  wave(p.ax + 10, seaY + 22, p.aw - 20, 4, [200, 225, 245]);
  // hull
  triangle(p.ax + 30, seaY - 8, p.ax + 420, seaY - 8, p.ax + 400, seaY + 22, [40, 40, 44]);
  fillRect(p.ax + 30, seaY - 8, 390, 10, [40, 40, 44]);
  // containers + bridge tower
  fillRect(p.ax + 60, seaY - 52, 52, 44, [200, 60, 40]);
  fillRect(p.ax + 118, seaY - 52, 52, 44, [40, 120, 90]);
  fillRect(p.ax + 176, seaY - 52, 52, 44, [220, 160, 40]);
  fillRect(p.ax + 330, seaY - 78, 56, 70, [240, 240, 235]);
  fillRect(p.ax + 340, seaY - 70, 36, 10, [31, 58, 95]);
  // flames + smoke
  triangle(p.ax + 230, seaY - 52, p.ax + 250, seaY - 96, p.ax + 270, seaY - 52, [255, 120, 0]);
  triangle(p.ax + 252, seaY - 52, p.ax + 268, seaY - 82, p.ax + 284, seaY - 52, [255, 200, 0]);
  circle(p.ax + 252, seaY - 100, 12, [120, 120, 120]);
  circle(p.ax + 268, seaY - 112, 15, [150, 150, 150]);
  circle(p.ax + 288, seaY - 104, 10, [120, 120, 120]);
  captions(24, 456, 476, ["ADNOC SHIP ATTACKED, 11 HURT", "ONE CREW MEMBER MISSING", "IRAN CLAIMS THREE TANKERS DISABLED"], 456 + 206);
}

// ---- panel 4: Kerch bridge strike ----
{
  const p = panel(524, 456, 476, 296, [90, 70, 50], "KERCH BRIDGE HIT AGAIN");
  const seaY = p.ay + 118;
  fillRect(p.ax, seaY, p.aw, 30, [38, 110, 170]);
  wave(p.ax + 10, seaY + 10, p.aw - 20, 4, [255, 255, 255]);
  wave(p.ax + 10, seaY + 22, p.aw - 20, 4, [200, 225, 245]);
  // towers
  fillRect(p.ax + 60, p.ay + 20, 22, 98, [110, 110, 108]);
  fillRect(p.ax + 370, p.ay + 20, 22, 98, [110, 110, 108]);
  // cables
  line(p.ax + 71, p.ay + 22, p.ax + 200, p.ay + 74, [90, 90, 90]);
  line(p.ax + 381, p.ay + 22, p.ax + 252, p.ay + 74, [90, 90, 90]);
  // deck with a gap in the middle
  fillRect(p.ax + 20, p.ay + 74, 180, 10, [70, 70, 70]);
  fillRect(p.ax + 252, p.ay + 74, 180, 10, [70, 70, 70]);
  // explosion burst at the gap
  const bx = p.ax + 226, by = p.ay + 70;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    triangle(bx, by,
      bx + Math.round(44 * Math.cos(a - 0.18)), by + Math.round(44 * Math.sin(a - 0.18)),
      bx + Math.round(44 * Math.cos(a + 0.18)), by + Math.round(44 * Math.sin(a + 0.18)),
      i % 2 === 0 ? [255, 160, 0] : [255, 220, 0]);
  }
  circle(bx, by, 14, [255, 240, 120]);
  circle(bx, by, 7, [255, 255, 255]);
  captions(524, 456, 476, ["THIRD STRIKE IN FOUR DAYS", "TRAFFIC HALTED", "UKRAINE HITS THE BRIDGE AGAIN"], 456 + 206);
}

// ---- panel 5: markets (wide) ----
{
  const p = panel(24, 762, 976, 238, [36, 59, 42], "WALL STREET FALLS - ANTHROPIC IPO SETS RECORD");
  const ax0 = p.ax + 30, ay0 = p.ay + 10, ax1 = p.ax + 560, ay1 = p.ay + 96;
  thickLine(ax0, ay0, ax0, ay1, INK, 3);
  thickLine(ax0, ay1, ax1, ay1, INK, 3);
  const pts = [
    [ax0 + 10, ay0 + 12], [ax0 + 120, ay0 + 26], [ax0 + 220, ay0 + 22],
    [ax0 + 320, ay0 + 48], [ax0 + 420, ay0 + 62], [ax0 + 510, ay0 + 84],
  ];
  polyline(pts, RED, 4);
  for (const [x, y] of pts) circle(x, y, 5, RED);
  // red arrow head at the end
  triangle(ax0 + 510, ay0 + 84, ax0 + 486, ay0 + 74, ax0 + 492, ay0 + 96, RED);
  // red label sits in the empty space above the falling line, clear of it
  drawText(ax0 + 300, ay0 + 2, "-2.0%", 4, RED);
  // green IPO bars on the right
  const bx0 = p.ax + 640, base = p.ay + 96;
  const heights = [22, 36, 52, 70, 92];
  heights.forEach((hh, i) =>
    fillRect(bx0 + i * 56, base - hh, 40, hh, [34, 139, 60]));
  drawText(bx0 + 8, p.ay - 2, "ANTHROPIC IPO", 2, [34, 139, 60]);
  captions(24, 762, 976, ["S&P 500 DOWN 2.0%, FIFTH STRAIGHT DROP", "ANTHROPIC IPO SETS RECORD"], 762 + 176);
}

const png = encodePNG();
writeFileSync(new URL("./entry.png", import.meta.url), png);

// ---- self-check log ----
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const data = readFileSync(new URL("./entry.png", import.meta.url));
console.log("bytes:", data.length);
console.log("sha256:", createHash("sha256").update(data).digest("hex"));
console.log("png header:", data[0], data[1], data[2], data[3],
  "width:", data.readUInt32BE(16), "height:", data.readUInt32BE(20));
const colors = new Set();
for (let i = 0; i < buf.length; i += 3)
  colors.add((buf[i] << 16) | (buf[i + 1] << 8) | buf[i + 2]);
console.log("distinct colors:", colors.size);
// non-emptiness: count non-paper pixels inside each panel art area
// (panel background is PAPER, so CREAM alone would count everything)
function nonEmpty(x0, y0, x1, y1) {
  let n = 0;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 3;
      if (buf[i] !== PAPER[0] || buf[i + 1] !== PAPER[1] || buf[i + 2] !== PAPER[2]) n++;
    }
  return n;
}
console.log("panel1 art non-cream px:", nonEmpty(36, 196, 500, 344));
console.log("panel2 art non-cream px:", nonEmpty(536, 196, 1000, 344));
console.log("panel3 art non-cream px:", nonEmpty(36, 502, 500, 650));
console.log("panel4 art non-cream px:", nonEmpty(536, 502, 1000, 650));
console.log("panel5 art non-cream px:", nonEmpty(36, 808, 1000, 906));
