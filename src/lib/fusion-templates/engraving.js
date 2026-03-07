/**
 * Fusion 360 template: Engraving (text or mountain silhouette).
 * Creates a sketch on the front face and extrude-cuts to engravingDepth.
 */

const ENGRAVING_DEPTH = 0.2; // cm (2mm)

/**
 * Generate engraving from pre-computed sketch commands (font outlines or SVG paths).
 * @param {Object} opts
 * @param {string} opts.sketchCommands - Python sketch API calls (lines/splines)
 * @param {string} opts.label          - Label for the engraving (e.g. "Schriftzug" or berg name)
 * @param {number} opts.breite         - Board width in cm
 * @param {number} opts.hoehe          - Board height in cm
 * @returns {string}
 */
export function engraving({ sketchCommands, label, breite, hoehe }) {
  if (!sketchCommands) return '';

  return `
        # ── Engraving: ${label} ──
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
