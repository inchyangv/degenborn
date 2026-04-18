/**
 * Minimal GIF89a encoder — pure Node.js, no native dependencies.
 * Supports multi-frame animations with per-frame delay.
 *
 * Implements:
 *  - LZW compression (variable-width codes, clear/EOI codes)
 *  - GIF89a Graphic Control Extension for frame delay
 *  - Global Color Table (up to 256 colors)
 */

export interface GifFrame {
  pixels: Uint8Array;  // indices into the color palette, row-major
  delay: number;       // centiseconds (1/100 s)
}

export interface GifOptions {
  width: number;
  height: number;
  palette: Array<[number, number, number]>; // up to 256 RGB triples
  frames: GifFrame[];
  loop?: number; // 0 = infinite, undefined = no loop
}

function ceilLog2(n: number): number {
  let bits = 1;
  while ((1 << bits) < n) bits++;
  return bits;
}

function lzwEncode(pixels: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  const out: number[] = [];
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxCode = () => 1 << codeSize;

  // Output bit stream (LSB first)
  let bitBuffer = 0;
  let bitCount = 0;

  function emitCode(code: number): void {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      out.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  }

  function flush(): void {
    if (bitCount > 0) {
      out.push(bitBuffer & 0xff);
      bitBuffer = 0;
      bitCount = 0;
    }
  }

  // LZW encode
  emitCode(clearCode);

  const table = new Map<string, number>();
  const reset = () => {
    table.clear();
    for (let i = 0; i < clearCode; i++) table.set(String.fromCharCode(i), i);
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  };
  reset();

  let current = String.fromCharCode(pixels[0]);
  for (let i = 1; i < pixels.length; i++) {
    const next = String.fromCharCode(pixels[i]);
    const combined = current + next;
    if (table.has(combined)) {
      current = combined;
    } else {
      emitCode(table.get(current)!);
      if (nextCode < 4096) {
        table.set(combined, nextCode++);
        if (nextCode > maxCode() && codeSize < 12) codeSize++;
      } else {
        emitCode(clearCode);
        reset();
      }
      current = next;
    }
  }
  emitCode(table.get(current)!);
  emitCode(eoiCode);
  flush();

  return new Uint8Array(out);
}

function packSubBlocks(data: Uint8Array): Uint8Array {
  const result: number[] = [];
  let offset = 0;
  while (offset < data.length) {
    const blockSize = Math.min(255, data.length - offset);
    result.push(blockSize);
    for (let i = 0; i < blockSize; i++) result.push(data[offset + i]);
    offset += blockSize;
  }
  result.push(0); // block terminator
  return new Uint8Array(result);
}

export function encodeGif(opts: GifOptions): Buffer {
  const { width, height, palette, frames, loop } = opts;
  const colorCount = palette.length;
  const gctBits = Math.max(1, ceilLog2(colorCount) - 1); // GCT size field (actual size = 2^(n+1))
  const gctSize = 1 << (gctBits + 1);
  const minCodeSize = Math.max(2, gctBits + 1);

  const bufs: Buffer[] = [];

  // Header
  bufs.push(Buffer.from("GIF89a", "ascii"));

  // Logical Screen Descriptor
  const lsd = Buffer.alloc(7);
  lsd.writeUInt16LE(width, 0);
  lsd.writeUInt16LE(height, 2);
  lsd[4] = 0x80 | gctBits; // GCT flag + color resolution (same) + size
  lsd[5] = 0; // background color index
  lsd[6] = 0; // pixel aspect ratio
  bufs.push(lsd);

  // Global Color Table (padded to gctSize entries)
  const gct = Buffer.alloc(gctSize * 3, 0);
  for (let i = 0; i < Math.min(colorCount, gctSize); i++) {
    gct[i * 3] = palette[i][0];
    gct[i * 3 + 1] = palette[i][1];
    gct[i * 3 + 2] = palette[i][2];
  }
  bufs.push(gct);

  // Netscape Application Extension (loop control)
  if (loop !== undefined) {
    bufs.push(Buffer.from([
      0x21, 0xff, 0x0b, // Extension + App Extension marker + block size
      ...Buffer.from("NETSCAPE2.0", "ascii"),
      0x03, 0x01, // sub-block size + index
      loop & 0xff, (loop >> 8) & 0xff, // loop count
      0x00, // block terminator
    ]));
  }

  // Frames
  for (const frame of frames) {
    // Graphic Control Extension
    const gce = Buffer.alloc(8);
    gce[0] = 0x21; // extension
    gce[1] = 0xf9; // graphic control label
    gce[2] = 0x04; // block size
    gce[3] = 0x00; // disposal = do not dispose, no user input, no transparent
    gce.writeUInt16LE(frame.delay, 4); // delay in centiseconds
    gce[6] = 0x00; // transparent color index (unused)
    gce[7] = 0x00; // block terminator
    bufs.push(gce);

    // Image Descriptor
    const id = Buffer.alloc(10);
    id[0] = 0x2c; // image separator
    id.writeUInt16LE(0, 1); // left
    id.writeUInt16LE(0, 3); // top
    id.writeUInt16LE(width, 5);
    id.writeUInt16LE(height, 7);
    id[9] = 0; // no local color table, not interlaced
    bufs.push(id);

    // LZW image data
    const compressed = lzwEncode(frame.pixels, minCodeSize);
    const subBlocks = packSubBlocks(compressed);

    bufs.push(Buffer.from([minCodeSize]));
    bufs.push(Buffer.from(subBlocks));
  }

  // Trailer
  bufs.push(Buffer.from([0x3b]));

  return Buffer.concat(bufs);
}

/** Rasterize a simple genesis "reveal" animation for a given archetype. */
export function renderGenesisFrames(
  width: number,
  height: number,
  archetypeColor: [number, number, number],
  bgColor: [number, number, number] = [13, 13, 13],
): { palette: Array<[number, number, number]>; frames: GifFrame[] } {
  // Palette: bg=0, full=1, dim=2, bright=3, glow1=4, glow2=5, white=6, dark=7
  const dimmed: [number, number, number] = [
    Math.round(archetypeColor[0] * 0.3),
    Math.round(archetypeColor[1] * 0.3),
    Math.round(archetypeColor[2] * 0.3),
  ];
  const glow1: [number, number, number] = [
    Math.min(255, archetypeColor[0] + 60),
    Math.min(255, archetypeColor[1] + 60),
    Math.min(255, archetypeColor[2] + 60),
  ];
  const palette: Array<[number, number, number]> = [
    bgColor,          // 0 background
    archetypeColor,   // 1 full color
    dimmed,           // 2 dimmed
    [30, 30, 30],     // 3 dark gray
    glow1,            // 4 bright glow
    [20, 20, 20],     // 5 near-black
    [255, 255, 255],  // 6 white
    [50, 50, 50],     // 7 mid-gray
  ];

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.32;

  function ellipsePixel(x: number, y: number, rx: number, ry: number): boolean {
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  }

  function makeFrame(progress: number, delay: number): GifFrame {
    const pixels = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const inBody = ellipsePixel(x, y, r * 0.75, r);
        const inHead = ellipsePixel(x, y - r * 0.6, r * 0.45, r * 0.45);
        const inGlow = ellipsePixel(x, y, r + 4, r + 4);
        const inShape = inBody || inHead;

        if (inShape && progress >= 1.0) {
          pixels[y * width + x] = 1; // full color
        } else if (inGlow && progress >= 0.75) {
          pixels[y * width + x] = 4; // glow edge
        } else if (inShape && progress >= 0.5) {
          pixels[y * width + x] = 2; // dimmed
        } else if (inShape && progress >= 0.25) {
          pixels[y * width + x] = 3; // dark
        } else if (inShape) {
          pixels[y * width + x] = 5; // near-black
        } else {
          pixels[y * width + x] = 0; // background
        }
      }
    }
    return { pixels, delay };
  }

  return {
    palette,
    frames: [
      makeFrame(0.0, 60),   // frame 1: 600ms – dark silhouette
      makeFrame(0.25, 60),  // frame 2: 600ms – darkening
      makeFrame(0.5, 60),   // frame 3: 600ms – dimmed color
      makeFrame(0.75, 60),  // frame 4: 600ms – glow appears
      makeFrame(1.0, 150),  // frame 5: 1500ms – full color hold
      makeFrame(0.75, 40),  // frame 6: 400ms – pulse back
      makeFrame(1.0, 100),  // frame 7: 1000ms – final hold
    ],
  };
}
