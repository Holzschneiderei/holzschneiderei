/**
 * Fusion 360 template: Hook holes (cuts) and hook body components.
 * Positions hooks along the top edge with EDGE_MARGIN and HOOK_SPACING.
 */

const HOOK_HOLE_RADIUS = 0.4;  // cm
const HOOK_HOLE_DEPTH = 1.5;   // cm
const HOOK_PEG_RADIUS = 0.38;  // cm (slightly smaller than hole)
const HOOK_PEG_LENGTH = 4.0;   // cm (visible peg length)

/**
 * @param {Object} opts
 * @param {number} opts.breite      - Board width in cm
 * @param {number} opts.hoehe       - Board height in cm
 * @param {number} opts.tiefe       - Board depth in cm
 * @param {number} opts.hookCount   - Number of hooks
 * @param {number} opts.edgeMargin  - Margin from board edge to first hook center (cm)
 * @param {number} opts.hookSpacing - Center-to-center spacing (cm)
 * @param {string} opts.hookMaterial - Hook material type
 * @returns {string}
 */
export function hooks({ breite, hoehe, tiefe, hookCount, edgeMargin, hookSpacing, hookMaterial }) {
  if (hookCount <= 0) return '';

  const positions = [];
  for (let i = 0; i < hookCount; i++) {
    positions.push(edgeMargin + i * hookSpacing);
  }

  const hookY = hoehe - 5; // 5cm from top
  const holeLines = [];
  const pegLines = [];

  positions.forEach((x, i) => {
    // Hook hole (cut into board from front face)
    holeLines.push(`
        # Hook hole ${i + 1} at x=${x.toFixed(1)}cm
        holeSketch${i} = boardComp.sketches.add(boardComp.xYConstructionPlane)
        holeCircles${i} = holeSketch${i}.sketchCurves.sketchCircles
        holeCircles${i}.addByCenterRadius(
            adsk.core.Point3D.create(${x.toFixed(4)}, ${hookY.toFixed(4)}, 0),
            ${HOOK_HOLE_RADIUS}
        )
        holeProfile${i} = holeSketch${i}.profiles.item(0)
        holeExtrude${i} = boardComp.features.extrudeFeatures.addSimple(
            holeProfile${i},
            adsk.core.ValueInput.createByReal(${HOOK_HOLE_DEPTH}),
            adsk.fusion.FeatureOperations.CutFeatureOperation
        )
        holeExtrude${i}.name = 'HookHole_${i + 1}'`);

    // Hook peg body (separate component)
    pegLines.push(`
        # Hook peg ${i + 1}
        hookOcc${i} = allOccs.addNewComponent(adsk.core.Matrix3D.create())
        hookComp${i} = hookOcc${i}.component
        hookComp${i}.name = 'Hook_${i + 1}_${hookMaterial}'

        hookSketch${i} = hookComp${i}.sketches.add(hookComp${i}.xYConstructionPlane)
        hookSketch${i}.sketchCurves.sketchCircles.addByCenterRadius(
            adsk.core.Point3D.create(${x.toFixed(4)}, ${hookY.toFixed(4)}, 0),
            ${HOOK_PEG_RADIUS}
        )
        hookProfile${i} = hookSketch${i}.profiles.item(0)
        hookExtrude${i} = hookComp${i}.features.extrudeFeatures.addSimple(
            hookProfile${i},
            adsk.core.ValueInput.createByReal(-${HOOK_PEG_LENGTH}),
            adsk.fusion.FeatureOperations.NewBodyFeatureOperation
        )
        hookExtrude${i}.bodies.item(0).name = 'HookPeg_${i + 1}'`);
  });

  return `
        # ── Hook Holes & Pegs (${hookCount} hooks, ${hookMaterial}) ──
${holeLines.join('\n')}

${pegLines.join('\n')}

`;
}
