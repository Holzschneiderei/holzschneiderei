/**
 * Fusion 360 template: Hat shelf (Hutablage).
 * Adds a shelf body at the top of the board with finger joint geometry on the back edge.
 */

const SHELF_THICKNESS = 1.8;  // cm
const SHELF_OVERHANG = 2.0;   // cm (how far shelf extends past board front)
const FINGER_WIDTH = 2.0;     // cm
const FINGER_DEPTH = 1.0;     // cm (into board)

/**
 * @param {Object} opts
 * @param {number} opts.breite - Board width in cm
 * @param {number} opts.hoehe  - Board height in cm
 * @param {number} opts.tiefe  - Board depth in cm
 * @returns {string}
 */
export function shelf({ breite, hoehe, tiefe }) {
  const shelfDepth = tiefe + SHELF_OVERHANG;
  const shelfY = hoehe; // sits on top of board

  // Generate finger joint cut positions along the back edge
  const fingerCount = Math.floor(breite / (FINGER_WIDTH * 2));
  const fingerLines = [];

  for (let i = 0; i < fingerCount; i++) {
    const fx = FINGER_WIDTH + i * FINGER_WIDTH * 2;
    if (fx + FINGER_WIDTH > breite) break;
    fingerLines.push(`
        fingerSketch${i} = shelfComp.sketches.add(shelfComp.xYConstructionPlane)
        fingerRect${i} = fingerSketch${i}.sketchCurves.sketchLines
        fingerRect${i}.addTwoPointRectangle(
            adsk.core.Point3D.create(${fx.toFixed(4)}, ${shelfY.toFixed(4)}, ${(tiefe - FINGER_DEPTH).toFixed(4)}),
            adsk.core.Point3D.create(${(fx + FINGER_WIDTH).toFixed(4)}, ${(shelfY + SHELF_THICKNESS).toFixed(4)}, ${tiefe.toFixed(4)})
        )
        fingerProfile${i} = fingerSketch${i}.profiles.item(0)
        shelfComp.features.extrudeFeatures.addSimple(
            fingerProfile${i},
            adsk.core.ValueInput.createByReal(${FINGER_DEPTH}),
            adsk.fusion.FeatureOperations.CutFeatureOperation
        )`);
  }

  return `
        # ── Hat Shelf (Hutablage) ──
        shelfOcc = allOccs.addNewComponent(adsk.core.Matrix3D.create())
        shelfComp = shelfOcc.component
        shelfComp.name = 'Hutablage'

        shelfSketch = shelfComp.sketches.add(shelfComp.xYConstructionPlane)
        shelfLines = shelfSketch.sketchCurves.sketchLines
        shelfLines.addTwoPointRectangle(
            adsk.core.Point3D.create(0, ${shelfY.toFixed(4)}, ${(-SHELF_OVERHANG).toFixed(4)}),
            adsk.core.Point3D.create(${breite}, ${(shelfY + SHELF_THICKNESS).toFixed(4)}, ${tiefe.toFixed(4)})
        )
        shelfProfile = shelfSketch.profiles.item(0)

        shelfExtrude = shelfComp.features.extrudeFeatures.addSimple(
            shelfProfile,
            adsk.core.ValueInput.createByReal(${SHELF_THICKNESS}),
            adsk.fusion.FeatureOperations.NewBodyFeatureOperation
        )
        shelfExtrude.bodies.item(0).name = 'ShelfBody'

        # Finger joints along back edge
${fingerLines.join('\n')}

`;
}
