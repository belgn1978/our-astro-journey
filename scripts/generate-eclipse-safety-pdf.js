const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'downloads', 'solar-eclipse-safety-guide.pdf');

const pageWidth = 612;
const pageHeight = 792;
const marginLeft = 56;
const marginRight = 56;
const topMargin = 64;
const bottomMargin = 54;
const contentWidth = pageWidth - marginLeft - marginRight;

const sections = [
  {
    title: 'The Upcoming Eclipse',
    paragraphs: [
      'The next major solar eclipse for Europe is the total solar eclipse on 12 August 2026. NASA path tables identify greatest eclipse at 17:45:53.8 UTC. The path of totality crosses Greenland, Iceland, and northern Spain before sunset. Outside that narrow track, observers will see a partial eclipse instead.',
      'For many people in the UK this event will be a late-day partial solar eclipse. Western locations with a clear horizon are generally better placed than heavily obstructed eastern urban horizons, because the Sun will be low by the time the eclipse is underway. Exact coverage and local timing depend on your location, so check a local eclipse map before the day.'
    ]
  },
  {
    title: 'Non-Negotiable Eye Safety',
    bullets: [
      'Use eclipse glasses or handheld solar viewers that conform to ISO 12312-2 for direct viewing of the uneclipsed, partially eclipsed, or annular Sun.',
      'Ordinary sunglasses are not safe, no matter how dark they look.',
      'Inspect viewers before use. Do not use them if they are scratched, punctured, torn, coming loose from the frame, or otherwise damaged.',
      'Put eclipse glasses on before looking up, and look away from the Sun before taking them off.',
      'If you normally wear prescription glasses, keep them on and place eclipse glasses over them.',
      'The only unaided-eye exception is totality, and only if you are inside the path of totality and the Sun\'s bright face is completely covered.'
    ]
  },
  {
    title: 'When Filters Stay On And When They Come Off',
    paragraphs: [
      'During every partial phase, filters stay on. That rule applies to your eyes, cameras, binoculars, spotting scopes, and telescopes. Outside the path of totality there is no safe moment to look at the Sun without proper solar filtration.',
      'If you are inside the path of totality, you may remove eclipse glasses only when the bright photosphere has vanished completely and totality has clearly begun. Replace them immediately when the first bright bead or bright edge of the Sun reappears.'
    ],
    bullets: [
      'Partial eclipse: filters on the whole time.',
      'Annular eclipse: filters on the whole time.',
      'Total eclipse outside the path of totality: filters on the whole time.',
      'Total eclipse inside the path of totality: glasses off only for the brief total phase.'
    ]
  },
  {
    title: 'Safe Solar Filters For Cameras, Binoculars, And Telescopes',
    paragraphs: [
      'For optics, the solar filter must be mounted securely over the front opening of the instrument so the sunlight is reduced before it enters the optics. This applies to camera lenses, binoculars, spotting scopes, and telescopes.',
      'Do not use screw-in eyepiece solar filters that mount at the back end of a telescope. Concentrated sunlight can crack or fail them very quickly.'
    ],
    bullets: [
      'Use front-mounted full-aperture filters from a reputable astronomy supplier.',
      'Make sure the filter cannot blow off or slide off accidentally.',
      'Cover or filter the finder scope too, or do not use it during solar work.',
      'Never look through an optical device while wearing eclipse glasses alone. The optics can concentrate enough light to destroy the viewer and injure your eyes.',
      'If you are not already comfortable with safe solar observing, keep the setup simple and ask an experienced astronomer to check it.'
    ]
  },
  {
    title: 'Phones And Tablets',
    paragraphs: [
      'A phone camera also needs a proper solar filter for the partial phases. The phone screen is not a protective filter, and digital zoom does not make an unfiltered image safe. Put the solar filter over the phone lens, not over your eyes.',
      'Purpose-made smartphone solar filters exist and are the safest option. If you are improvising any attachment, it must hold the filter flat, centered, and secure without letting bright sunlight leak around the lens.'
    ],
    bullets: [
      'Do not point an unfiltered phone at the partial Sun for long periods.',
      'Do not place a phone behind unfiltered binoculars or an unfiltered telescope.',
      'Use the rear camera, lock focus and exposure if your phone allows it, and keep sessions short to reduce device heating.',
      'If you are inside totality, remove the phone filter only during totality if you want the corona or landscape-darkening shots, then replace it immediately afterward.'
    ]
  },
  {
    title: 'Camera Setup Advice',
    bullets: [
      'Use a tripod if possible. It helps with framing, focus, and keeping the Sun in shot during changing light.',
      'Practice before eclipse day. Rehearse fitting and removing the filter, finding focus, and changing exposure without rushing.',
      'For partial phases, use the solar filter and expose for the bright solar surface, not the sky around it.',
      'Manual focus is usually safer than autofocus once you have a crisp solar edge or sunspot detail.',
      'A longer lens captures more solar detail, but even a short lens or phone can make a useful documentary image.',
      'Do not spend the entire eclipse staring at menus. A simple, repeatable plan beats an ambitious one.'
    ]
  },
  {
    title: 'Imaging Totality Without Missing It',
    paragraphs: [
      'Totality is fundamentally different from the partial phases. The corona, prominences, and darkened landscape appear only then, and they require very different exposures from the filtered partial phases.',
      'The safest beginner plan is to keep totality imaging simple. Decide in advance whether your priority is a wide scenic shot, a filtered partial-phase sequence, or a small number of totality frames. Do not try to run a complicated script if you have never practiced it.'
    ],
    bullets: [
      'Remove the solar filter from the camera only during totality, and only if you are truly inside the path of totality.',
      'Have a spoken checklist for filter off at totality and filter back on at the end.',
      'Bracket exposures if your camera allows it, because the corona spans a huge brightness range.',
      'Take a few frames, then stop and look. The eclipse experience matters more than a long burst you never review.'
    ]
  },
  {
    title: 'Safer Alternatives For Groups And Beginners',
    bullets: [
      'Use eclipse glasses from a vetted supplier for quick direct views.',
      'Use pinhole projection for children, schools, or casual group viewing.',
      'Use a filtered spotting scope or filtered telescope only if the filter fit is secure and the operator understands the risks.',
      'If you are unsure about any accessory, do not use it on eclipse day.'
    ]
  },
  {
    title: 'Five Simple Eclipse Experiments With Household Items',
    paragraphs: [
      'These activities are safe because they avoid direct viewing or use only certified viewers where noted. They are good for families, school-style demonstrations, or a cloudy-day backup if the Sun keeps disappearing behind clouds.'
    ],
    bullets: [
      'Colander projection: Hold a kitchen colander, slotted spoon, or anything with repeating holes so sunlight falls onto paving, paper, or a wall. During the partial phases, each bright spot turns into a tiny crescent Sun.',
      'Cereal-box pinhole projector: Use a cereal box, foil, white paper, and tape to make a simple projection viewer. Compare how the crescent changes every 10 to 15 minutes.',
      'Leaf-shadow test: Stand under a tree and look at the small gaps between leaves on the ground. Those natural pinholes project many little eclipse crescents during the partial phases.',
      'Temperature and light log: Use a notebook, kitchen timer, and household thermometer or phone weather readout to record changes in brightness, temperature, wind, and bird activity before, during, and after maximum eclipse.',
      'Shadow-shape challenge: Put round household objects such as jar lids, coins, or cups on white card and trace how their shadows sharpen and soften as the eclipse progresses. If you have certified eclipse glasses, pair this with quick direct checks of the Sun\'s changing shape.'
    ]
  },
  {
    title: 'Red Flags',
    bullets: [
      'Sellers who cannot identify the manufacturer of the glasses or filter material.',
      'Cheap marketplace listings with vague safety claims but no traceable supplier.',
      'Filters that fit loosely, wobble, or can be nudged off the front of the lens or telescope.',
      'Rear-mounted eyepiece solar filters.',
      'Advice that says sunglasses, smoked glass, CDs, exposed film, or stacked neutral-density filters are safe. They are not.'
    ]
  },
  {
    title: 'Reference Points Used For This Guide',
    bullets: [
      'AAS Solar Eclipse Task Force: eye safety guidance, optics filter guidance, vetted supplier lists, and imaging guidance.',
      'NASA eclipse path tables for the 12 August 2026 total solar eclipse.',
      'Cross-check geography for the 2026 totality track using public eclipse references covering Greenland, Iceland, and Spain.'
    ]
  }
];

function escapePdfText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function textWidth(text, fontSize) {
  return text.length * fontSize * 0.5;
}

function wrapText(text, fontSize, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (textWidth(candidate, fontSize) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function createPage() {
  return {
    commands: [],
    y: pageHeight - topMargin
  };
}

const pages = [];
let currentPage = createPage();

function pushPage() {
  pages.push(currentPage);
  currentPage = createPage();
}

function ensureSpace(height) {
  if (currentPage.y - height < bottomMargin) {
    pushPage();
  }
}

function addTextLine(text, x, y, fontKey, fontSize) {
  currentPage.commands.push(`BT /${fontKey} ${fontSize} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`);
}

function addWrappedText(text, options = {}) {
  const fontKey = options.fontKey || 'F1';
  const fontSize = options.fontSize || 11;
  const x = options.x || marginLeft;
  const maxWidth = options.maxWidth || contentWidth;
  const lineHeight = options.lineHeight || Math.round(fontSize * 1.45);
  const spacingAfter = options.spacingAfter || 8;
  const lines = wrapText(text, fontSize, maxWidth);

  ensureSpace(lines.length * lineHeight + spacingAfter);

  for (const line of lines) {
    addTextLine(line, x, currentPage.y, fontKey, fontSize);
    currentPage.y -= lineHeight;
  }

  currentPage.y -= spacingAfter;
}

function addBullet(text) {
  const bulletFontSize = 11;
  const bulletX = marginLeft;
  const textX = marginLeft + 16;
  const maxWidth = contentWidth - 16;
  const lineHeight = 15;
  const lines = wrapText(text, bulletFontSize, maxWidth);

  ensureSpace(lines.length * lineHeight + 4);
  addTextLine('-', bulletX, currentPage.y, 'F1', bulletFontSize);

  for (const [index, line] of lines.entries()) {
    addTextLine(line, textX, currentPage.y, 'F1', bulletFontSize);
    currentPage.y -= lineHeight;
    if (index === 0 && lines.length > 1) {
      // Keep wrapped lines aligned with the first line.
    }
  }

  currentPage.y -= 4;
}

function addSectionTitle(title) {
  ensureSpace(28);
  addTextLine(title, marginLeft, currentPage.y, 'F2', 16);
  currentPage.y -= 22;
}

function addFooter(page, pageNumber, pageCount) {
  page.commands.push(`0.35 0.44 0.62 rg 56 26 500 0.7 re f`);
  page.commands.push(`BT /F1 9 Tf 1 0 0 1 56 16 Tm (Our Astro Journey) Tj ET`);
  page.commands.push(`BT /F1 9 Tf 1 0 0 1 475 16 Tm (Page ${pageNumber} of ${pageCount}) Tj ET`);
}

function buildContent() {
  currentPage.commands.push('0.05 0.10 0.23 rg 0 0 612 792 re f');
  currentPage.commands.push('0.95 0.96 0.99 rg 0 642 612 150 re f');
  currentPage.commands.push('0.98 0.71 0.15 rg 56 676 90 10 re f');
  currentPage.commands.push('0.29 0.62 1.00 rg 56 658 170 6 re f');
  currentPage.commands.push('0.00 0.00 0.00 rg');

  addTextLine('Solar Eclipse Safety And Imaging Guide', 56, 720, 'F2', 24);
  addTextLine('For the 12 August 2026 eclipse and future solar observing sessions', 56, 690, 'F1', 12);
  currentPage.y = 628;

  addWrappedText('This guide focuses on one rule above all others: for every partial phase, use proper solar protection for your eyes and for every optical system pointed at the Sun.', {
    fontKey: 'F1',
    fontSize: 12,
    lineHeight: 18,
    spacingAfter: 12
  });

  addSectionTitle('Fast Checklist');
  [
    'Certified eclipse glasses or handheld viewers for direct viewing.',
    'Front-mounted solar filters for cameras, binoculars, or telescopes.',
    'A practiced plan for removing and replacing camera filters only during totality, if you will be inside the path.',
    'A simple imaging plan that leaves time to actually watch the eclipse.',
    'One or two safe household experiments for children or first-time observers.'
  ].forEach(addBullet);

  currentPage.y -= 6;
  addWrappedText('Updated for summer 2026 using AAS eye-safety guidance and NASA eclipse path tables.', {
    fontKey: 'F1',
    fontSize: 10,
    lineHeight: 14,
    spacingAfter: 0
  });

  pushPage();

  for (const section of sections) {
    addSectionTitle(section.title);

    for (const paragraph of section.paragraphs || []) {
      addWrappedText(paragraph, {
        fontKey: 'F1',
        fontSize: 11,
        lineHeight: 16,
        spacingAfter: 8
      });
    }

    for (const bullet of section.bullets || []) {
      addBullet(bullet);
    }

    currentPage.y -= 8;
  }

  pages.push(currentPage);
}

function buildPdf() {
  buildContent();

  const pageCount = pages.length;
  pages.forEach((page, index) => addFooter(page, index + 1, pageCount));

  const objects = [];

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');

  const kids = [];
  for (let index = 0; index < pageCount; index += 1) {
    kids.push(`${3 + index * 2} 0 R`);
  }
  objects.push(`<< /Type /Pages /Count ${pageCount} /Kids [${kids.join(' ')}] >>`);

  pages.forEach((page) => {
    const content = page.commands.join('\n');
    const contentObjectNumber = objects.length + 2;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${contentObjectNumber + 1} 0 R /F2 ${contentObjectNumber + 2} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`);
  });

  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  objects.push('<< /Producer (GitHub Copilot) /Title (Solar Eclipse Safety And Imaging Guide) /Author (Our Astro Journey) /Subject (Safe solar eclipse viewing and imaging) /CreationDate (D:20260730000000Z) >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  const infoObjectNumber = objects.length;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObjectNumber} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pdf, 'binary');
  console.log(`Wrote ${outputPath}`);
}

buildPdf();