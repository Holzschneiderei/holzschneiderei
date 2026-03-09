/**
 * Fusion 360 Python script header template.
 * Sets up imports, design context, and metadata comment block.
 */

interface HeaderOpts {
  customerName: string;
  configId: string;
  productLabel: string;
  holzart: string;
  breite: number;
  hoehe: number;
  tiefe: number;
}

export function header({ customerName, configId, productLabel, holzart, breite, hoehe, tiefe }: HeaderOpts): string {
  return `# -*- coding: utf-8 -*-
# Holzschneiderei – Fusion 360 Production Script
# Generated: ${new Date().toISOString()}
# Config ID: ${sanitize(configId)}
# Customer: ${sanitize(customerName)}
# Product: ${sanitize(productLabel)}
# Wood: ${sanitize(holzart)} | Dimensions: ${breite} x ${hoehe} x ${tiefe} cm

import adsk.core, adsk.fusion, traceback

def run(context):
    app = adsk.core.Application.get()
    ui = app.userInterface
    try:
        doc = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
        design = adsk.fusion.Design.cast(app.activeProduct)
        design.designType = adsk.fusion.DesignTypes.ParametricDesignType
        rootComp = design.rootComponent
        allOccs = rootComp.occurrences

`;
}

/** Escape user strings for safe embedding in Python comments/string literals */
function sanitize(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/[^\x20-\x7E\xC0-\xFF]/g, '');
}

export { sanitize };
