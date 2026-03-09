/**
 * Convert mountain SVG paths (M/L only) to Fusion 360 sketch line commands.
 * Mountain paths use a 100x70 coordinate space that gets scaled to board dimensions.
 */

interface SvgPathOpts {
  svgPath: string;
  boardWidthCm: number;
  boardHeightCm: number;
  bergName: string;
}

interface PathCommand {
  type: string;
  x: number;
  y: number;
}

export function convertSvgPath({ svgPath, boardWidthCm, boardHeightCm, bergName }: SvgPathOpts): { sketchCommands: string } {
  const commands = parsePath(svgPath);
  if (commands.length === 0) return { sketchCommands: '' };

  const scaleX = boardWidthCm / 100;
  const scaleY = boardHeightCm / 70;

  // Mountain SVG has Y=0 at top, Y=70 at bottom. Fusion has Y=0 at bottom.
  // So we flip: fusionY = boardHeight - (svgY * scaleY)
  const safeName = bergName.replace(/[^\x20-\x7E]/g, '').replace(/[\n\r]/g, '');
  const lines: string[] = [`        # Mountain silhouette: ${safeName}`];
  let prevX: number | null = null;
  let prevY: number | null = null;

  for (const cmd of commands) {
    const fx = cmd.x * scaleX;
    const fy = boardHeightCm - cmd.y * scaleY;

    if (cmd.type === 'M') {
      prevX = fx;
      prevY = fy;
    } else if (cmd.type === 'L' && prevX != null) {
      lines.push(
        `        engLines.addByTwoPoints(` +
        `adsk.core.Point3D.create(${prevX.toFixed(4)}, ${fy.toFixed(4)}, 0), ` +
        `adsk.core.Point3D.create(${fx.toFixed(4)}, ${fy.toFixed(4)}, 0))`
      );
      // Correct: draw from prev to current
      lines.pop();
      lines.push(
        `        engLines.addByTwoPoints(` +
        `adsk.core.Point3D.create(${prevX.toFixed(4)}, ${prevY!.toFixed(4)}, 0), ` +
        `adsk.core.Point3D.create(${fx.toFixed(4)}, ${fy.toFixed(4)}, 0))`
      );
      prevX = fx;
      prevY = fy;
    }
  }

  // Close the path along the bottom edge to make it a closed profile
  if (prevX != null) {
    // Line from last point down to bottom-right
    lines.push(
      `        engLines.addByTwoPoints(` +
      `adsk.core.Point3D.create(${prevX.toFixed(4)}, ${prevY!.toFixed(4)}, 0), ` +
      `adsk.core.Point3D.create(${(boardWidthCm).toFixed(4)}, 0, 0))`
    );
    // Line along bottom edge
    lines.push(
      `        engLines.addByTwoPoints(` +
      `adsk.core.Point3D.create(${(boardWidthCm).toFixed(4)}, 0, 0), ` +
      `adsk.core.Point3D.create(0, 0, 0))`
    );
    // Line from bottom-left up to first point
    const firstCmd = commands[0]!;
    const firstX = firstCmd.x * scaleX;
    const firstY = boardHeightCm - firstCmd.y * scaleY;
    lines.push(
      `        engLines.addByTwoPoints(` +
      `adsk.core.Point3D.create(0, 0, 0), ` +
      `adsk.core.Point3D.create(${firstX.toFixed(4)}, ${firstY.toFixed(4)}, 0))`
    );
  }

  return { sketchCommands: lines.join('\n') };
}

/**
 * Parse an SVG path string into an array of {type, x, y} commands.
 * Only handles M and L commands (which is all mountain paths use).
 */
function parsePath(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const tokens = d.match(/[ML]|[-+]?[0-9]*\.?[0-9]+/g);
  if (!tokens) return commands;

  let currentType = 'M';
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i]!;
    if (token === 'M' || token === 'L') {
      currentType = token;
      i++;
      continue;
    }
    const x = parseFloat(token);
    const y = parseFloat(tokens[i + 1]!);
    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      commands.push({ type: currentType, x, y });
      // After first M coord pair, subsequent pairs are treated as L
      if (currentType === 'M') currentType = 'L';
    }
    i += 2;
  }

  return commands;
}
