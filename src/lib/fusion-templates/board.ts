/**
 * Fusion 360 template: Board body extrusion.
 * Creates the main board as a rectangular extrusion (width x height x depth).
 */

interface BoardOpts {
  breite: number;
  hoehe: number;
  tiefe: number;
}

export function board({ breite, hoehe, tiefe }: BoardOpts): string {
  return `
        # ── Board Body ──
        boardOcc = allOccs.addNewComponent(adsk.core.Matrix3D.create())
        boardComp = boardOcc.component
        boardComp.name = 'Board'

        boardSketch = boardComp.sketches.add(boardComp.xYConstructionPlane)
        boardLines = boardSketch.sketchCurves.sketchLines
        boardLines.addTwoPointRectangle(
            adsk.core.Point3D.create(0, 0, 0),
            adsk.core.Point3D.create(${breite}, ${hoehe}, 0)
        )
        boardProfile = boardSketch.profiles.item(0)

        boardExtrude = boardComp.features.extrudeFeatures.addSimple(
            boardProfile,
            adsk.core.ValueInput.createByReal(${tiefe}),
            adsk.fusion.FeatureOperations.NewBodyFeatureOperation
        )
        boardBody = boardExtrude.bodies.item(0)
        boardBody.name = 'BoardBody'

`;
}
