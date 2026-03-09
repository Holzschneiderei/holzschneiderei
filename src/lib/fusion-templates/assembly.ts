/**
 * Fusion 360 template: Assembly finalization.
 * Applies wood material appearance, fits viewport, shows success message.
 */

import { sanitize } from './header';

const WOOD_MATERIALS: Record<string, string> = {
  eiche: 'Oak',
  esche: 'Ash',
  nussbaum: 'Walnut',
  ahorn: 'Maple',
  arve: 'Pine',
};

interface AssemblyOpts {
  holzart: string;
  customerName: string;
  configId: string;
}

export function assembly({ holzart, customerName, configId }: AssemblyOpts): string {
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
