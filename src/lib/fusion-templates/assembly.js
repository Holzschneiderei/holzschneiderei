/**
 * Fusion 360 template: Assembly finalization.
 * Applies wood material appearance, fits viewport, shows success message.
 */

import { sanitize } from './header.js';

const WOOD_MATERIALS = {
  eiche: 'Oak',
  esche: 'Ash',
  nussbaum: 'Walnut',
  ahorn: 'Maple',
  arve: 'Pine',
};

/**
 * @param {Object} opts
 * @param {string} opts.holzart     - Wood type key
 * @param {string} opts.customerName - Customer name for success message
 * @param {string} opts.configId    - Configuration ID
 * @returns {string}
 */
export function assembly({ holzart, customerName, configId }) {
  const materialName = WOOD_MATERIALS[holzart] || 'Oak';

  return `
        # ── Assembly: Materials & Viewport ──
        # Try to apply wood material appearance
        materialLib = app.materialLibraries.itemByName('Fusion 360 Appearance Library')
        if materialLib:
            appearances = materialLib.appearances
            for i in range(appearances.count):
                appear = appearances.item(i)
                if '${materialName}' in appear.name:
                    for body in rootComp.bRepBodies:
                        body.appearance = appear
                    break

        # Fit the viewport to show the full assembly
        viewport = app.activeViewport
        viewport.fit()

        # Success message
        ui.messageBox(
            'Holzschneiderei Production Script\\n\\n'
            'Customer: ${sanitize(customerName)}\\n'
            'Config: ${sanitize(configId)}\\n\\n'
            'Assembly generated successfully.\\n'
            'Please review all dimensions before machining.',
            'Holzschneiderei',
            adsk.core.MessageBoxButtonTypes.OKButtonType,
            adsk.core.MessageBoxIconTypes.InformationIconType
        )

    except:
        if ui:
            ui.messageBox('Script failed:\\n{}'.format(traceback.format_exc()))
`;
}
