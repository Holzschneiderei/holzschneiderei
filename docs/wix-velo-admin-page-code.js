/**
 * Wix Velo Page Code for /konfigurator-admin
 *
 * Paste this into the page code panel in the Wix Editor (Dev Mode).
 * This extends the customer page code with admin-specific behavior:
 * - Loads saved settings from CMS on page load and pushes them to the iframe
 * - The iframe URL should include ?mode=admin (or the admin-settings message triggers admin mode)
 */

import wixData from 'wix-data';

const CHANNEL = 'holzschneiderei';
const STORAGE_KEY = 'holzschneiderei_progress';
const IFRAME_ID = '#html1';

function reply(type, payload = {}) {
  $w(IFRAME_ID).postMessage({ channel: CHANNEL, type, ...payload });
}

$w.onReady(async function () {
  // Load admin settings from CMS and push to iframe when it's ready
  $w(IFRAME_ID).onMessage(async (event) => {
    const msg = event.data;
    if (!msg || msg.channel !== CHANNEL) return;

    switch (msg.type) {
      case 'ready': {
        // Push admin settings to iframe on load
        try {
          const result = await wixData.query('KonfiguratorAdmin').find();
          if (result.items.length > 0) {
            const settings = result.items[0];
            reply('admin-settings', {
              pricing: settings.pricing ? JSON.parse(settings.pricing) : null,
              constraints: settings.constraints ? JSON.parse(settings.constraints) : null,
            });
          }
        } catch (err) {
          console.error('Failed to load admin settings:', err);
        }
        break;
      }

      case 'save-settings': {
        const { pricing, constraints } = msg;
        try {
          const existing = await wixData.query('KonfiguratorAdmin').find();
          if (existing.items.length > 0) {
            await wixData.update('KonfiguratorAdmin', {
              ...existing.items[0],
              pricing: JSON.stringify(pricing),
              constraints: JSON.stringify(constraints),
              updatedAt: new Date(),
            });
          } else {
            await wixData.insert('KonfiguratorAdmin', {
              pricing: JSON.stringify(pricing),
              constraints: JSON.stringify(constraints),
              updatedAt: new Date(),
            });
          }
          reply('settings-saved', { success: true });
        } catch (err) {
          reply('settings-saved', { success: false, error: err.message });
        }
        break;
      }

      case 'config-save': {
        // Legacy admin config save — also persist to CMS
        if (msg.config) {
          try {
            const existing = await wixData.query('KonfiguratorAdmin').find();
            const data = {
              pricing: JSON.stringify(msg.config.pricing),
              constraints: JSON.stringify(msg.config.constr),
              updatedAt: new Date(),
            };
            if (existing.items.length > 0) {
              await wixData.update('KonfiguratorAdmin', { ...existing.items[0], ...data });
            } else {
              await wixData.insert('KonfiguratorAdmin', data);
            }
          } catch (err) {
            console.error('Failed to save config:', err);
          }
        }
        break;
      }

      // Progress persistence (not typically used on admin page, but included for completeness)
      case 'save-progress':
      case 'load-progress':
      case 'clear-progress':
      case 'resize':
      case 'step-change':
      case 'order-submit':
        break;
    }
  });
});
