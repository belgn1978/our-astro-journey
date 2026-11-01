/* Extract a single uncompressed 2-D science plane without changing its pixels. */
(function (root) {
  'use strict';
  function extractScience(buffer) {
    var bytes = new Uint8Array(buffer), decoder = new TextDecoder('ascii');
    var offset = 0, primary = [], images = [];
    function key(card) { return card.slice(0, 8).trim(); }
    function value(card) {
      var raw = card.slice(10).trim();
      if (raw[0] === "'") return raw.slice(1, raw.indexOf("'", 1)).trim();
      return raw.split('/')[0].trim();
    }
    while (offset < bytes.length) {
      var start = offset, cards = [], values = {}, ended = false;
      while (offset + 80 <= bytes.length) {
        var card = decoder.decode(bytes.subarray(offset, offset + 80)); offset += 80;
        if (key(card) === 'END') { ended = true; break; }
        cards.push(card);
        if (card[8] === '=') values[key(card)] = value(card);
      }
      if (!ended) throw new Error('Incomplete FITS header; try downloading again.');
      if (start === 0 && values.SIMPLE !== 'T') throw new Error('The archive response is not a FITS image.');
      var dataStart = start + Math.ceil((offset - start) / 2880) * 2880;
      var axes = Number(values.NAXIS), bitpix = Number(values.BITPIX);
      if (!Number.isInteger(axes) || axes < 0 || axes > 999 || [8,16,32,64,-32,-64].indexOf(bitpix) < 0) throw new Error('Unsupported FITS image layout.');
      var pixels = axes ? 1 : 0;
      for (var n = 1; n <= axes; n++) {
        var size = Number(values['NAXIS' + n]);
        if (!Number.isSafeInteger(size) || size < 0) throw new Error('Invalid FITS image dimensions.');
        pixels *= size;
      }
      var dataSize = (pixels + Number(values.PCOUNT || 0)) * Number(values.GCOUNT || 1) * Math.abs(bitpix) / 8;
      if (!Number.isSafeInteger(dataSize) || dataSize < 0 || dataStart + Math.ceil(dataSize / 2880) * 2880 > bytes.length) throw new Error('Incomplete FITS data; try downloading again.');
      if (values.GROUPS === 'T') throw new Error('Random-group FITS needs desktop software. Download the original.');
      if (axes === 2 && pixels > 0 && (start === 0 || values.XTENSION === 'IMAGE') && !values.ZIMAGE) {
        images.push({ cards: cards, values: values, start: dataStart, size: dataSize, primary: start === 0 });
      }
      if (start === 0) primary = cards;
      offset = dataStart + Math.ceil(dataSize / 2880) * 2880;
    }
    var science = images.filter(function (im) { return im.values.EXTNAME === 'SCI'; });
    if (science.length > 1) throw new Error('This file has several SCI detector images. Download the original and choose the detector in desktop software.');
    var image = science[0] || images.find(function (im) { return im.primary; });
    if (!image) throw new Error('No uncompressed 2-D SCI image found. Download the original for desktop software.');
    function makeCard(k, v) { return (k.padEnd(8) + '= ' + String(v).padStart(20)).padEnd(80); }
    var out = [makeCard('SIMPLE', 'T'), makeCard('BITPIX', image.values.BITPIX), makeCard('NAXIS', '2'), makeCard('NAXIS1', image.values.NAXIS1), makeCard('NAXIS2', image.values.NAXIS2)];
    var skip = /^(SIMPLE|XTENSION|BITPIX|NAXIS\d*|PCOUNT|GCOUNT|EXTEND|EXTNAME|EXTVER|CHECKSUM|DATASUM|THEAP|END)$/;
    image.cards.forEach(function (card) { if (!skip.test(key(card))) out.push(card); });
    // Only inherit descriptive primary metadata. Keep the science HDU's WCS,
    // scaling and units authoritative; obsolete checksums are removed.
    ['TELESCOP','INSTRUME','FILTER','FILTER1','FILTER2','PUPIL','OBJECT','TARGNAME','EXPTIME','DATE-OBS'].forEach(function (k) {
      if (image.values[k] !== undefined) return;
      var card = primary.find(function (c) { return key(c) === k; });
      if (card) out.push(card);
    });
    out.push(('HISTORY Extracted one science image by Our Astro Journey; pixel bytes unchanged.').padEnd(80));
    out.push('END'.padEnd(80));
    var header = new TextEncoder().encode(out.join('').padEnd(Math.ceil(out.length * 80 / 2880) * 2880));
    return { parts: [header, bytes.subarray(image.start, image.start + image.size), new Uint8Array((2880 - image.size % 2880) % 2880)], width: Number(image.values.NAXIS1), height: Number(image.values.NAXIS2), filter: image.values.FILTER || image.values.FILTER1 || '' };
  }
  root.OajFits = { extractScience: extractScience };
})(typeof window === 'undefined' ? globalThis : window);
