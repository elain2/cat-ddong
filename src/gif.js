// 의존성 없는 아주 작은 GIF89a 인코더 (움직이는 고양이 저장용)
(function (root) {
  function hexToRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }

  // GIF용 LZW. minCodeSize는 팔레트 비트 수(최소 2).
  function lzw(indices, minCodeSize) {
    const clear = 1 << minCodeSize;
    const eoi = clear + 1;
    const out = [];
    let cur = 0, shift = 0;
    let codeSize = minCodeSize + 1;
    let next = eoi + 1;
    let table = new Map();

    const emit = (code) => {
      cur |= code << shift;
      shift += codeSize;
      while (shift >= 8) { out.push(cur & 255); cur >>>= 8; shift -= 8; }
    };

    emit(clear);
    let prefix = indices[0];
    for (let i = 1; i < indices.length; i++) {
      const k = indices[i];
      const key = prefix * 256 + k;
      const found = table.get(key);
      if (found !== undefined) {
        prefix = found;
        continue;
      }
      emit(prefix);
      if (next === 4096) {                 // 사전이 가득 참 → 초기화
        emit(clear);
        table = new Map();
        codeSize = minCodeSize + 1;
        next = eoi + 1;
      } else {
        if (next >= (1 << codeSize)) codeSize++;
        table.set(key, next++);
      }
      prefix = k;
    }
    emit(prefix);
    emit(eoi);
    if (shift > 0) out.push(cur & 255);
    return out;
  }

  // frames: [{ grid(32x32 색 문자열|null), delay(ms) }], scale: 확대 배율, bg: 배경색(hex)
  // 반환: Uint8Array. 색이 256개를 넘으면 null.
  function encode(frames, scale, bg, transparent) {
    const n = frames[0].grid.length;
    const size = n * scale;

    const palette = [bg];
    const indexOf = new Map([[bg, 0]]);
    for (const f of frames) {
      for (const row of f.grid) {
        for (const c of row) {
          if (c && !indexOf.has(c)) { indexOf.set(c, palette.length); palette.push(c); }
        }
      }
    }
    if (palette.length > 256) return null;

    let bits = 2;
    while ((1 << bits) < palette.length) bits++;
    const bytes = [];
    const w16 = (v) => bytes.push(v & 255, (v >> 8) & 255);

    // 헤더 + 논리 화면 + 전역 색상표
    'GIF89a'.split('').forEach((ch) => bytes.push(ch.charCodeAt(0)));
    w16(size); w16(size);
    bytes.push(0x80 | 0x70 | (bits - 1), 0, 0);
    for (let i = 0; i < (1 << bits); i++) {
      const rgb = hexToRgb(palette[i] || bg);
      bytes.push(rgb[0], rgb[1], rgb[2]);
    }
    // 무한 반복
    bytes.push(0x21, 0xff, 0x0b);
    'NETSCAPE2.0'.split('').forEach((ch) => bytes.push(ch.charCodeAt(0)));
    bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

    for (const f of frames) {
      // 그래픽 제어: 이전 프레임을 배경으로 지우고(disposal 2) 다음 프레임을 그린다
      bytes.push(0x21, 0xf9, 0x04, transparent ? 0x09 : 0x08);   // 0번 색을 투명으로 쓸지
      w16(Math.max(2, Math.round(f.delay / 10)));
      bytes.push(0x00, 0x00);

      bytes.push(0x2c);
      w16(0); w16(0); w16(size); w16(size);
      bytes.push(0x00);

      const px = new Uint8Array(size * size);
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const c = f.grid[y][x];
          const idx = c ? indexOf.get(c) : 0;
          if (!idx) continue;
          for (let dy = 0; dy < scale; dy++) {
            const base = (y * scale + dy) * size + x * scale;
            for (let dx = 0; dx < scale; dx++) px[base + dx] = idx;
          }
        }
      }
      const minCode = Math.max(2, bits);
      bytes.push(minCode);
      const data = lzw(px, minCode);
      for (let i = 0; i < data.length; i += 255) {
        const chunk = data.slice(i, i + 255);
        bytes.push(chunk.length);
        for (const b of chunk) bytes.push(b);
      }
      bytes.push(0x00);
    }
    bytes.push(0x3b);
    return Uint8Array.from(bytes);
  }

  root.Gif = { encode };
})(typeof window !== 'undefined' ? window : globalThis);
