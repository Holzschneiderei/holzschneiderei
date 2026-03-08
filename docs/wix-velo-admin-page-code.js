/**
 * Wix Velo Page Code for /konfigurator-admin
 *
 * Paste this into the page code panel in the Wix Editor (Dev Mode).
 *
 * Prerequisites:
 * - CMS collection "KonfiguratorAdmin" with fields:
 *     _id:       text (auto)
 *     config:    text (the full JSON config blob — products, showroom, pricing, etc.)
 *     updatedAt: date
 * - Dev Mode enabled in Wix Editor
 * - HtmlComponent ID matches IFRAME_ID below (default: #html1)
 *
 * The iframe URL should include ?mode=admin
 */

import wixData from 'wix-data';

const CHANNEL = 'holzschneiderei';
const IFRAME_ID = '#adminIframe';
const COLLECTION = 'KonfiguratorAdmin';

function reply(type, payload = {}) {
  $w(IFRAME_ID).postMessage({ channel: CHANNEL, type, ...payload });
}

/**
 * Load the single admin config row from CMS.
 * Returns the parsed config object, or null if none exists.
 */
async function loadConfig() {
  const result = await wixData.query(COLLECTION).limit(1).find();
  if (result.items.length > 0 && result.items[0].config) {
    return { row: result.items[0], config: JSON.parse(result.items[0].config) };
  }
  return { row: null, config: null };
}


$w.onReady(async function () {
  // Keep a reference to the CMS row for faster upserts
  let adminRow = null;

  $w(IFRAME_ID).onMessage(async (event) => {
    const msg = event.data;
    if (!msg || msg.channel !== CHANNEL) return;

    switch (msg.type) {

      // ── Iframe ready: send full config ──
      case 'ready': {
        try {
          const { row, config } = await loadConfig();
          adminRow = row;
          if (config) {
            // Send the FULL config blob — the iframe's applyConfig() restores everything
            reply('config-load', { config });
          }
          // Also set admin mode (in case iframe URL doesn't have ?mode=admin)
          reply('set-mode', { mode: 'admin' });
        } catch (err) {
          console.error('Failed to load admin config:', err);
        }
        break;
      }

      // ── Auto-save: persist the full config blob ──
      case 'config-save': {
        if (msg.config) {
          try {
            const data = {
              config: JSON.stringify(msg.config),
              updatedAt: new Date(),
            };
            if (adminRow) {
              const updated = { ...adminRow, ...data };
              await wixData.update(COLLECTION, updated);
              adminRow = updated;
            } else {
              const inserted = await wixData.insert(COLLECTION, data);
              adminRow = inserted;
            }
          } catch (err) {
            console.error('Failed to save config:', err);
          }
        }
        break;
      }

      // ── Legacy save-settings (kept for backward compat) ──
      case 'save-settings': {
        // The config-save handler above already persists everything.
        // This handler exists in case older code still sends save-settings.
        reply('settings-saved', { success: true });
        break;
      }

      // ── Ignored on admin page ──
      case 'save-progress':
      case 'load-progress':
      case 'clear-progress':
      case 'resize':
      case 'step-change':
      case 'order-submit':
      case 'submit-config':
      case 'request-checkout':
        break;
    }
  });
});
