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

const palette = {
  page: [0.98, 0.98, 0.97],
  panel: [1.0, 1.0, 1.0],
  heading: [0.10, 0.17, 0.30],
  accent: [0.83, 0.54, 0.11],
  rule: [0.74, 0.79, 0.87],
  body: [0.10, 0.12, 0.16],
  softPanel: [0.95, 0.96, 0.99]
};

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
    commands: [
      `${palette.page[0]} ${palette.page[1]} ${palette.page[2]} rg 0 0 ${pageWidth} ${pageHeight} re f`,
      `${palette.panel[0]} ${palette.panel[1]} ${palette.panel[2]} rg 28 30 ${pageWidth - 56} ${pageHeight - 60} re f`,
      `${palette.rule[0]} ${palette.rule[1]} ${palette.rule[2]} RG 1.2 w 56 ${pageHeight - 86} m ${pageWidth - 56} ${pageHeight - 86} l S`,
      `${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`
    ],
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

function addWrappedTextAt(text, options = {}) {
  const fontKey = options.fontKey || 'F1';
  const fontSize = options.fontSize || 10;
  const x = options.x || marginLeft;
  const y = options.y || currentPage.y;
  const maxWidth = options.maxWidth || contentWidth;
  const lineHeight = options.lineHeight || Math.round(fontSize * 1.45);
  const spacingAfter = options.spacingAfter || 0;
  const lines = wrapText(text, fontSize, maxWidth);
  let cursorY = y;

  for (const line of lines) {
    addTextLine(line, x, cursorY, fontKey, fontSize);
    cursorY -= lineHeight;
  }

  return cursorY - spacingAfter;
}

function drawFilledRect(x, y, width, height, color) {
  currentPage.commands.push(`${color[0]} ${color[1]} ${color[2]} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
}

function drawStrokedRect(x, y, width, height, color, lineWidth = 1) {
  currentPage.commands.push(`${color[0]} ${color[1]} ${color[2]} RG ${lineWidth.toFixed(2)} w ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`);
}

function drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
  currentPage.commands.push(`${color[0]} ${color[1]} ${color[2]} RG ${lineWidth.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function drawCircle(centerX, centerY, radius, options = {}) {
  const k = 0.552284749831;
  const c = radius * k;
  const fillColor = options.fillColor;
  const strokeColor = options.strokeColor;
  const lineWidth = options.lineWidth || 1;
  const op = fillColor && strokeColor ? 'B' : fillColor ? 'f' : 'S';
  const path = `${(centerX + radius).toFixed(2)} ${centerY.toFixed(2)} m ${(centerX + radius).toFixed(2)} ${(centerY + c).toFixed(2)} ${(centerX + c).toFixed(2)} ${(centerY + radius).toFixed(2)} ${centerX.toFixed(2)} ${(centerY + radius).toFixed(2)} c ${(centerX - c).toFixed(2)} ${(centerY + radius).toFixed(2)} ${(centerX - radius).toFixed(2)} ${(centerY + c).toFixed(2)} ${(centerX - radius).toFixed(2)} ${centerY.toFixed(2)} c ${(centerX - radius).toFixed(2)} ${(centerY - c).toFixed(2)} ${(centerX - c).toFixed(2)} ${(centerY - radius).toFixed(2)} ${centerX.toFixed(2)} ${(centerY - radius).toFixed(2)} c ${(centerX + c).toFixed(2)} ${(centerY - radius).toFixed(2)} ${(centerX + radius).toFixed(2)} ${(centerY - c).toFixed(2)} ${(centerX + radius).toFixed(2)} ${centerY.toFixed(2)} c`;

  if (fillColor) {
    currentPage.commands.push(`${fillColor[0]} ${fillColor[1]} ${fillColor[2]} rg`);
  }
  if (strokeColor) {
    currentPage.commands.push(`${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG ${lineWidth.toFixed(2)} w`);
  }
  currentPage.commands.push(`${path} ${op}`);
}

function drawExperimentIllustration(type, x, y, width, height) {
  const sun = [0.99, 0.78, 0.28];
  const ink = [0.16, 0.21, 0.30];
  const soft = [0.90, 0.93, 0.98];

  drawFilledRect(x, y, width, height, [0.98, 0.99, 1.0]);
  drawStrokedRect(x, y, width, height, [0.80, 0.84, 0.92], 0.8);

  if (type === 'colander') {
    drawCircle(x + 42, y + height - 38, 16, { fillColor: sun, strokeColor: [0.75, 0.56, 0.10], lineWidth: 1 });
    drawFilledRect(x + 90, y + height - 62, 62, 26, soft);
    drawStrokedRect(x + 90, y + height - 62, 62, 26, ink, 1);
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        drawCircle(x + 98 + col * 11, y + height - 56 + row * 7, 1.8, { fillColor: ink });
      }
    }
    drawLine(x + 55, y + height - 42, x + 95, y + height - 50, [0.95, 0.67, 0.20], 1.2);
    for (let i = 0; i < 6; i += 1) {
      drawCircle(x + 30 + i * 20, y + 22, 5, { fillColor: [0.98, 0.92, 0.66], strokeColor: [0.80, 0.70, 0.40], lineWidth: 0.7 });
      drawCircle(x + 33 + i * 20, y + 22, 5, { fillColor: [0.98, 0.99, 1.0] });
    }
  }

  if (type === 'pinhole') {
    drawCircle(x + 42, y + height - 36, 14, { fillColor: sun, strokeColor: [0.75, 0.56, 0.10], lineWidth: 1 });
    drawFilledRect(x + 84, y + 26, 92, 70, [0.95, 0.82, 0.54]);
    drawStrokedRect(x + 84, y + 26, 92, 70, ink, 1);
    drawFilledRect(x + 84, y + 26, 34, 70, [0.92, 0.74, 0.44]);
    drawFilledRect(x + 171, y + 54, 5, 12, [0.28, 0.33, 0.42]);
    drawLine(x + 57, y + height - 38, x + 172, y + 60, [0.96, 0.70, 0.24], 1.2);
    drawFilledRect(x + 90, y + 36, 24, 48, [0.99, 0.99, 0.99]);
    drawCircle(x + 102, y + 58, 5, { fillColor: [0.98, 0.92, 0.66], strokeColor: [0.80, 0.70, 0.40], lineWidth: 0.7 });
    drawCircle(x + 104.5, y + 58, 5, { fillColor: [0.99, 0.99, 0.99] });
  }

  if (type === 'leaf') {
    drawCircle(x + 36, y + height - 34, 13, { fillColor: sun, strokeColor: [0.75, 0.56, 0.10], lineWidth: 1 });
    drawFilledRect(x + 22, y + 20, 5, 35, [0.47, 0.30, 0.17]);
    drawCircle(x + 24, y + 64, 14, { fillColor: [0.42, 0.63, 0.33], strokeColor: [0.30, 0.48, 0.23], lineWidth: 0.6 });
    drawCircle(x + 36, y + 70, 13, { fillColor: [0.42, 0.63, 0.33], strokeColor: [0.30, 0.48, 0.23], lineWidth: 0.6 });
    drawCircle(x + 48, y + 64, 14, { fillColor: [0.42, 0.63, 0.33], strokeColor: [0.30, 0.48, 0.23], lineWidth: 0.6 });
    for (let i = 0; i < 7; i += 1) {
      const cx = x + 85 + i * 16;
      drawCircle(cx, y + 24 + (i % 2 === 0 ? 0 : 7), 5, { fillColor: [0.98, 0.92, 0.66], strokeColor: [0.80, 0.70, 0.40], lineWidth: 0.7 });
      drawCircle(cx + 2.4, y + 24 + (i % 2 === 0 ? 0 : 7), 5, { fillColor: [0.98, 0.99, 1.0] });
    }
    drawLine(x + 48, y + 62, x + 104, y + 34, [0.96, 0.70, 0.24], 1.0);
  }

  if (type === 'log') {
    drawCircle(x + 36, y + height - 34, 12, { fillColor: sun, strokeColor: [0.75, 0.56, 0.10], lineWidth: 1 });
    drawFilledRect(x + 74, y + 24, 62, 70, [0.99, 0.99, 0.99]);
    drawStrokedRect(x + 74, y + 24, 62, 70, ink, 1);
    for (let row = 0; row < 5; row += 1) {
      drawLine(x + 80, y + 82 - row * 12, x + 130, y + 82 - row * 12, [0.72, 0.78, 0.90], 0.8);
    }
    drawFilledRect(x + 147, y + 34, 10, 50, [0.89, 0.94, 1.0]);
    drawStrokedRect(x + 147, y + 34, 10, 50, ink, 1);
    drawFilledRect(x + 149, y + 34, 6, 24, [0.46, 0.72, 0.95]);
    drawCircle(x + 177, y + 44, 17, { strokeColor: ink, lineWidth: 1.1 });
    drawLine(x + 177, y + 44, x + 177, y + 54, ink, 1);
    drawLine(x + 177, y + 44, x + 185, y + 44, ink, 1);
  }

  if (type === 'shadow') {
    drawCircle(x + 42, y + height - 36, 13, { fillColor: sun, strokeColor: [0.75, 0.56, 0.10], lineWidth: 1 });
    drawFilledRect(x + 84, y + 24, 118, 70, [0.99, 0.99, 0.99]);
    drawStrokedRect(x + 84, y + 24, 118, 70, [0.82, 0.86, 0.93], 0.8);
    drawCircle(x + 108, y + 72, 8, { fillColor: [0.82, 0.84, 0.88], strokeColor: ink, lineWidth: 0.8 });
    drawCircle(x + 134, y + 74, 11, { fillColor: [0.82, 0.84, 0.88], strokeColor: ink, lineWidth: 0.8 });
    drawFilledRect(x + 157, y + 63, 20, 20, [0.82, 0.84, 0.88]);
    drawStrokedRect(x + 157, y + 63, 20, 20, ink, 0.8);
    drawLine(x + 52, y + height - 38, x + 112, y + 54, [0.95, 0.67, 0.20], 1);
    drawLine(x + 52, y + height - 38, x + 138, y + 56, [0.95, 0.67, 0.20], 1);
    drawLine(x + 52, y + height - 38, x + 167, y + 52, [0.95, 0.67, 0.20], 1);
    drawFilledRect(x + 113, y + 38, 13, 5, [0.65, 0.70, 0.77]);
    drawFilledRect(x + 142, y + 37, 17, 6, [0.65, 0.70, 0.77]);
    drawFilledRect(x + 171, y + 34, 23, 8, [0.65, 0.70, 0.77]);
  }

  currentPage.commands.push(`${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`);
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

function addBulletInCard(text, x, y, width) {
  addTextLine('-', x, y, 'F1', 9);
  return addWrappedTextAt(text, {
    fontKey: 'F1',
    fontSize: 9,
    x: x + 10,
    y,
    maxWidth: width - 14,
    lineHeight: 12,
    spacingAfter: 3
  });
}

function addSectionTitle(title) {
  ensureSpace(28);
  currentPage.commands.push(`${palette.heading[0]} ${palette.heading[1]} ${palette.heading[2]} rg`);
  addTextLine(title, marginLeft, currentPage.y, 'F2', 16);
  drawLine(marginLeft, currentPage.y - 6, pageWidth - marginRight, currentPage.y - 6, palette.rule, 0.8);
  currentPage.commands.push(`${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`);
  currentPage.y -= 22;
}

function addExperimentCard(experiment, x, topY, width, height) {
  const bottomY = topY - height;
  drawFilledRect(x, bottomY, width, height, [1.0, 1.0, 1.0]);
  drawStrokedRect(x, bottomY, width, height, [0.76, 0.81, 0.90], 1.1);

  currentPage.commands.push(`${palette.heading[0]} ${palette.heading[1]} ${palette.heading[2]} rg`);
  addTextLine(experiment.title, x + 14, topY - 22, 'F2', 12);

  const illustrationY = topY - 150;
  drawExperimentIllustration(experiment.diagram, x + 14, illustrationY, 200, 100);

  currentPage.commands.push(`${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`);
  addTextLine('How to do it', x + 224, topY - 34, 'F2', 9);

  let textY = topY - 50;
  textY = addWrappedTextAt(`Materials: ${experiment.materials}`, {
    fontKey: 'F1',
    fontSize: 9,
    x: x + 224,
    y: textY,
    maxWidth: width - 238,
    lineHeight: 12,
    spacingAfter: 5
  });

  for (const step of experiment.steps) {
    textY = addBulletInCard(step, x + 224, textY, width - 238);
  }

  currentPage.commands.push(`${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`);
}

function addFindingsArea(x, y, width, height) {
  drawFilledRect(x, y, width, height, [0.99, 0.99, 1.0]);
  drawStrokedRect(x, y, width, height, [0.78, 0.83, 0.91], 1);

  currentPage.commands.push(`${palette.heading[0]} ${palette.heading[1]} ${palette.heading[2]} rg`);
  addTextLine('Your Findings', x + 14, y + height - 22, 'F2', 12);
  currentPage.commands.push(`${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`);

  addTextLine('Date:', x + 14, y + height - 40, 'F1', 9);
  drawLine(x + 44, y + height - 43, x + 190, y + height - 43, [0.76, 0.80, 0.88], 0.8);
  addTextLine('Location:', x + 214, y + height - 40, 'F1', 9);
  drawLine(x + 264, y + height - 43, x + width - 14, y + height - 43, [0.76, 0.80, 0.88], 0.8);

  const checks = ['Cloud cover', 'Wind shift', 'Bird/insect activity', 'Temperature drop'];
  const checkStartY = y + height - 56;
  const checkSpacingX = 118;
  for (const [index, label] of checks.entries()) {
    const boxX = x + 14 + index * checkSpacingX;
    drawStrokedRect(boxX, checkStartY, 8, 8, [0.63, 0.70, 0.82], 0.9);
    addTextLine(label, boxX + 12, checkStartY + 1, 'F1', 8);
  }

  const lines = 6;
  const topLineY = y + height - 78;
  const spacing = 16;
  for (let i = 0; i < lines; i += 1) {
    const lineY = topLineY - i * spacing;
    drawLine(x + 14, lineY, x + width - 14, lineY, [0.80, 0.84, 0.91], 0.7);
  }
}

function addExperimentBooklet() {
  const experiments = [
    {
      title: '1. Colander Projection',
      diagram: 'colander',
      materials: 'Colander or slotted spoon, white card or paving slab.',
      steps: [
        'Let sunlight pass through the holes onto a flat surface.',
        'As the eclipse deepens, bright dots become tiny crescents.',
        'Take photos of the pattern every 10 minutes.'
      ]
    },
    {
      title: '2. Cereal-Box Pinhole Viewer',
      diagram: 'pinhole',
      materials: 'Cereal box, foil, tape, white paper, pin.',
      steps: [
        'Tape white paper inside one end as the viewing screen.',
        'Make one tiny pinhole in foil at the opposite end.',
        'Stand with your back to the Sun and view the projection inside.'
      ]
    },
    {
      title: '3. Leaf-Shadow Test',
      diagram: 'leaf',
      materials: 'A sunny tree canopy and clear ground.',
      steps: [
        'Check the ground under leaves during partial phases.',
        'Natural gaps project many small crescents at once.',
        'Compare the crescent shape before and near maximum eclipse.'
      ]
    },
    {
      title: '4. Temperature And Light Log',
      diagram: 'log',
      materials: 'Notebook, timer, thermometer or weather app.',
      steps: [
        'Record temperature, brightness, and wind every 5 to 10 minutes.',
        'Note changes in birds, insects, and ambient sound.',
        'Plot your readings after the event to show the eclipse curve.'
      ]
    },
    {
      title: '5. Shadow-Shape Challenge',
      diagram: 'shadow',
      materials: 'Coins, jar lids, cups, white card, pencil.',
      steps: [
        'Place objects on white card and trace each shadow outline.',
        'Repeat as the eclipse progresses and compare edge sharpness.',
        'Use certified glasses only for brief checks of Sun shape.'
      ]
    }
  ];

  for (const [index, experiment] of experiments.entries()) {
    if (currentPage.commands.length > 4 || currentPage.y < pageHeight - topMargin - 1) {
      pushPage();
    }

    currentPage.commands.push(`${palette.heading[0]} ${palette.heading[1]} ${palette.heading[2]} rg`);
    addTextLine(`Illustrated Experiment Booklet (${index + 1} of ${experiments.length})`, marginLeft, pageHeight - 106, 'F2', 18);
    currentPage.commands.push(`${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`);
    addWrappedTextAt('Use this page in the field: follow the setup, then record what changed as the eclipse progressed.', {
      fontKey: 'F1',
      fontSize: 10,
      x: marginLeft,
      y: pageHeight - 126,
      maxWidth: contentWidth,
      lineHeight: 14,
      spacingAfter: 0
    });

    addExperimentCard(experiment, marginLeft, 620, contentWidth, 320);
    addFindingsArea(marginLeft, 84, contentWidth, 166);
    currentPage.y = bottomMargin;
  }
}

function addFooter(page, pageNumber, pageCount) {
  page.commands.push(`${palette.rule[0]} ${palette.rule[1]} ${palette.rule[2]} rg 56 26 500 0.7 re f`);
  page.commands.push(`BT /F1 9 Tf 1 0 0 1 56 16 Tm (Our Astro Journey) Tj ET`);
  page.commands.push(`BT /F1 9 Tf 1 0 0 1 467 16 Tm (Page ${pageNumber} of ${pageCount}) Tj ET`);
}

function buildContent() {
  drawFilledRect(40, 556, 532, 194, [0.97, 0.98, 1.0]);
  drawStrokedRect(40, 556, 532, 194, [0.77, 0.82, 0.91], 1.2);
  drawFilledRect(56, 708, 190, 14, [0.88, 0.91, 0.97]);
  drawFilledRect(56, 686, 132, 6, [0.96, 0.79, 0.37]);
  drawCircle(511, 691, 34, { fillColor: [0.12, 0.16, 0.24], strokeColor: [0.08, 0.11, 0.18], lineWidth: 1 });
  drawCircle(519, 691, 34, { fillColor: [0.97, 0.98, 1.0] });
  currentPage.commands.push(`${palette.heading[0]} ${palette.heading[1]} ${palette.heading[2]} rg`);

  addTextLine('Solar Eclipse Safety And Imaging Guide', 56, 724, 'F2', 24);
  addTextLine('Professional field booklet for safe viewing, imaging, and family experiments', 56, 697, 'F1', 11);
  currentPage.commands.push(`${palette.body[0]} ${palette.body[1]} ${palette.body[2]} rg`);
  currentPage.y = 620;

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

  addExperimentBooklet();

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