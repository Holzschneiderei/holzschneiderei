/**
 * Fusion 360 template: Engraving (text or mountain silhouette).
 * Creates a sketch on the front face and extrude-cuts to engravingDepth.
 */

import { sanitize } from './header';

const ENGRAVING_DEPTH = 0.2; // cm (2mm)

interface EngravingOpts {
  sketchCommands: string;
  label: string;
  breite: number;
  hoehe: number;
}

export function engraving({ sketchCommands, label, breite, hoehe }: EngravingOpts): string {
  if (!sketchCommands) return '';

  return `
        # ── Engraving: ${sanitize(label)} ──
        engravingSketch = boardComp.sketches.add(boardComp.xYConstructionPlane)
        engravingSketch.name = 'Engraving_${label.replace(/[^a-zA-Z0-9]/g, '_')}'
        engLines = engravingSketch.sketchCurves.sketchLines
        engArcs = engravingSketch.sketchCurves.sketchArcs
        engSplines = engravingSketch.sketchCurves.sketchFittedSplines

${sketchCommands}

        # Extrude-cut the engraving profiles
        engProfiles = adsk.core.ObjectCollection.create()
        for pi in range(engravingSketch.profiles.count):
            engProfiles.add(engravingSketch.profiles.item(pi))
        if engProfiles.count > 0:
            engExtInput = boardComp.features.extrudeFeatures.createInput(
                engProfiles,
                adsk.fusion.FeatureOperations.CutFeatureOperation
            )
            engExtInput.setDistanceExtent(
                False,
                adsk.core.ValueInput.createByReal(${ENGRAVING_DEPTH})
            )
            engExtrude = boardComp.features.extrudeFeatures.add(engExtInput)
            engExtrude.name = 'Engraving_Cut'

`;
}

export { ENGRAVING_DEPTH };
