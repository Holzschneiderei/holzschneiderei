/**
 * Extract font glyph outlines using opentype.js and convert to
 * Fusion 360 sketch API commands.
 *
 * Lazy-loads opentype.js only when needed (at checkout time).
 */

const FONT_MAP = {
  sans: '/fonts/engraving/sans.otf',
  serif: '/fonts/engraving/serif.otf',
  slab: '/fonts/engraving/slab.otf',
  condensed: '/fonts/engraving/condensed.otf',
  rounded: '/fonts/engraving/rounded.otf',
  script: '/fonts/engraving/script.otf',
};

const BEZIER_SAMPLES = 8; // points to sample along each bezier curve

/**
 * @param {Object} opts
 * @param {string} opts.text           - The text to engrave
 * @param {string} opts.fontKey        - Font key (sans, serif, etc.)
 * @param {number} opts.targetWidthCm  - Available width for text in cm
 * @param {number} opts.boardHeightCm  - Board height in cm (for vertical centering)
 * @returns {Promise<{ sketchCommands: string }>}
 */
export async function extractFontOutlines({ text, fontKey, targetWidthCm, boardHeightCm }) {
  if (!text || !fontKey) return { sketchCommands: '' };

  const opentype = await import('opentype.js');
  const fontUrl = FONT_MAP[fontKey];
  if (!fontUrl) return { sketchCommands: '' };

  const response = await fetch(fontUrl);
  const buffer = await response.arrayBuffer();
  const font = opentype.parse(buffer);

  // Measure text at a reference size, then scale to fit targetWidth
  const refSize = 100; // reference font size in font units
  const path = font.getPath(text, 0, 0, refSize);
  const bbox = path.getBoundingBox();
  const textWidth = bbox.x2 - bbox.x1;
  const textHeight = bbox.y2 - bbox.y1;

  if (textWidth <= 0 || textHeight <= 0) return { sketchCommands: '' };

  // Scale to fit within targetWidthCm
  const scale = targetWidthCm / textWidth;
  const scaledHeight = textHeight * scale;

  // Center text horizontally and vertically on the board
  const offsetX = (targetWidthCm - textWidth * scale) / 2;
  // Place text at ~40% of board height (visually centered on upper portion)
  const centerY = boardHeightCm * 0.4;
  const offsetY = centerY + scaledHeight / 2;

  // Convert path commands to Fusion 360 sketch commands
  const lines = [`        # Text engraving: '${text.replace(/'/g, "\\'")}'`];
  let curX = 0, curY = 0;
  let moveX = 0, moveY = 0;

  for (const cmd of path.commands) {
    switch (cmd.type) {
      case 'M': {
        curX = (cmd.x - bbox.x1) * scale + offsetX;
        curY = offsetY - (cmd.y - bbox.y1) * scale; // flip Y
        moveX = curX;
        moveY = curY;
        break;
      }
      case 'L': {
        const lx = (cmd.x - bbox.x1) * scale + offsetX;
        const ly = offsetY - (cmd.y - bbox.y1) * scale;
        lines.push(
          `        engLines.addByTwoPoints(` +
          `adsk.core.Point3D.create(${curX.toFixed(4)}, ${curY.toFixed(4)}, 0), ` +
          `adsk.core.Point3D.create(${lx.toFixed(4)}, ${ly.toFixed(4)}, 0))`
        );
        curX = lx;
        curY = ly;
        break;
      }
      case 'Q': {
        // Quadratic bezier -> sample points -> fitted spline
        const points = sampleQuadratic(
          curX, curY,
          (cmd.x1 - bbox.x1) * scale + offsetX, offsetY - (cmd.y1 - bbox.y1) * scale,
          (cmd.x - bbox.x1) * scale + offsetX, offsetY - (cmd.y - bbox.y1) * scale,
          BEZIER_SAMPLES
        );
        lines.push(splineCommand(points));
        curX = points[points.length - 1][0];
        curY = points[points.length - 1][1];
        break;
      }
      case 'C': {
        // Cubic bezier -> sample points -> fitted spline
        const points = sampleCubic(
          curX, curY,
          (cmd.x1 - bbox.x1) * scale + offsetX, offsetY - (cmd.y1 - bbox.y1) * scale,
          (cmd.x2 - bbox.x1) * scale + offsetX, offsetY - (cmd.y2 - bbox.y1) * scale,
          (cmd.x - bbox.x1) * scale + offsetX, offsetY - (cmd.y - bbox.y1) * scale,
          BEZIER_SAMPLES
        );
        lines.push(splineCommand(points));
        curX = points[points.length - 1][0];
        curY = points[points.length - 1][1];
        break;
      }
      case 'Z': {
        // Close path back to last move point
        if (Math.abs(curX - moveX) > 0.001 || Math.abs(curY - moveY) > 0.001) {
          lines.push(
            `        engLines.addByTwoPoints(` +
            `adsk.core.Point3D.create(${curX.toFixed(4)}, ${curY.toFixed(4)}, 0), ` +
            `adsk.core.Point3D.create(${moveX.toFixed(4)}, ${moveY.toFixed(4)}, 0))`
          );
        }
        curX = moveX;
        curY = moveY;
        break;
      }
    }
  }

  return { sketchCommands: lines.join('\n') };
}

/** Sample points along a quadratic bezier curve */
function sampleQuadratic(x0, y0, cx, cy, x1, y1, n) {
  const points = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    points.push([
      mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
      mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
    ]);
  }
  return points;
}

/** Sample points along a cubic bezier curve */
function sampleCubic(x0, y0, cx1, cy1, cx2, cy2, x1, y1, n) {
  const points = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    points.push([
      mt * mt * mt * x0 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x1,
      mt * mt * mt * y0 + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * y1,
    ]);
  }
  return points;
}

/** Generate a Fusion 360 fitted spline command from an array of [x,y] points */
function splineCommand(points) {
  const pointsStr = points
    .map(([x, y]) => `adsk.core.Point3D.create(${x.toFixed(4)}, ${y.toFixed(4)}, 0)`)
    .join(', ');
  return `        engSplines.add(adsk.core.ObjectCollection.createWithArray([${pointsStr}]))`;
}
