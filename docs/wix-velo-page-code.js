/**
 * Wix Velo Page Code for /garderobe-konfigurieren
 *
 * Paste this into the page code panel in the Wix Editor (Dev Mode).
 *
 * Prerequisites:
 * - CMS collection "KonfiguratorAdmin" with field:
 *     config: text (full JSON config blob, saved by admin page)
 * - CMS collection "Konfigurationen" for order submissions
 * - Dev Mode enabled in Wix Editor
 * - HtmlComponent ID matches IFRAME_ID below (default: #html1)
 * - Wix eCommerce / Payments set up (Premium plan, CHF currency) — optional
 */

import wixData from 'wix-data';
import { local as storage } from 'wix-storage-frontend';
// Uncomment when eCommerce is set up:
// import { checkout } from '@wix/ecom';
// import wixLocationFrontend from 'wix-location-frontend';

const CHANNEL = 'holzschneiderei';
const STORAGE_KEY = 'holzschneiderei_progress';
const IFRAME_ID = '#html1';

function reply(type, payload = {}) {
  $w(IFRAME_ID).postMessage({ channel: CHANNEL, type, ...payload });
}

$w.onReady(function () {
  $w(IFRAME_ID).onMessage(async (event) => {
    const msg = event.data;
    if (!msg || msg.channel !== CHANNEL) return;

    switch (msg.type) {

      // ── Iframe ready: load config + progress ──
      case 'ready': {
        // 1. Load admin config (products, showroom, pricing, steps, etc.)
        try {
          const result = await wixData.query('KonfiguratorAdmin').limit(1).find();
          if (result.items.length > 0 && result.items[0].config) {
            const config = JSON.parse(result.items[0].config);
            reply('config-load', { config });
          }
        } catch (err) {
          console.error('Failed to load config:', err);
        }

        // 2. Load saved progress from localStorage
        let state = null;
        try {
          const saved = storage.getItem(STORAGE_KEY);
          if (saved) state = JSON.parse(saved);
        } catch { /* corrupt data — ignore */ }
        reply('progress-loaded', { state });
        break;
      }

      // ── Progress Persistence ──

      case 'save-progress':
        try {
          storage.setItem(STORAGE_KEY, JSON.stringify(msg.state));
        } catch { /* quota exceeded — ignore */ }
        break;

      case 'load-progress': {
        let state = null;
        try {
          const saved = storage.getItem(STORAGE_KEY);
          if (saved) state = JSON.parse(saved);
        } catch { /* corrupt data — ignore */ }
        reply('progress-loaded', { state });
        break;
      }

      case 'clear-progress':
        storage.removeItem(STORAGE_KEY);
        break;

      // ── Configuration Submission ──

      case 'submit-config': {
        const { config, sessionId } = msg;
        try {
          const result = await wixData.insert('Konfigurationen', {
            sessionId,
            holzart: config.holzart,
            oberflaeche: config.oberflaeche,
            breite: config.breite,
            hoehe: config.hoehe,
            tiefe: config.tiefe,
            haken: config.haken,
            hakenMaterial: config.hakenMaterial,
            extras: JSON.stringify(config.extras),
            berg: config.berg,
            schriftart: config.schriftart,
            namenszug: config.namenszug,
            typ: config.typ,
            hutablage: config.hutablage,
            bemerkungen: config.bemerkungen,
            preis: config.preis,
            anrede: config.anrede,
            vorname: config.vorname,
            nachname: config.nachname,
            email: config.email,
            telefon: config.telefon,
            strasse: config.strasse,
            plz: config.plz,
            ort: config.ort,
            status: 'draft',
          });
          reply('config-saved', { success: true, configId: result._id });
        } catch (err) {
          reply('config-saved', { success: false, error: err.message });
        }
        break;
      }

      // ── Checkout / Payment ──

      case 'request-checkout': {
        const { configId, price, summary } = msg;
        try {
          // TODO: Uncomment when eCommerce is set up
          // const result = await checkout.createCheckout({
          //   channelType: 'WEB',
          //   customLineItems: [{
          //     quantity: 1,
          //     price: String(price),
          //     productName: { original: `Garderobe: ${summary}` },
          //     itemType: { preset: 'PHYSICAL' },
          //   }]
          // });
          //
          // await wixData.update('Konfigurationen', {
          //   _id: configId,
          //   checkoutId: result._id,
          //   status: 'pending'
          // });
          //
          // reply('checkout-ready', { checkoutUrl: result.checkoutUrl });
          // wixLocationFrontend.to(result.checkoutUrl);

          // Fallback until eCommerce is set up: send a truthy URL so iframe transitions to "done"
          reply('checkout-ready', { checkoutUrl: '#order-confirmed' });
        } catch (err) {
          reply('checkout-error', { error: err.message });
        }
        break;
      }

      // ── Ignored on customer page ──
      case 'save-settings':
        reply('settings-saved', { success: true });
        break;

      case 'config-save':
      case 'resize':
      case 'step-change':
      case 'order-submit':
        break;
    }
  });
});
