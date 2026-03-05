/**
 * Wix Velo Page Code for /garderobe-konfigurieren
 *
 * Paste this into the page code panel in the Wix Editor (Dev Mode).
 * Make sure the HtmlComponent ID matches (default: #html1).
 *
 * Prerequisites:
 * - Wix CMS collection "Konfigurationen" created with fields from integration-plan.md
 * - Wix eCommerce / Payments set up (Premium plan, CHF currency)
 * - Dev Mode enabled in Wix Editor
 */

import wixData from 'wix-data';
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

      // ── Progress Persistence ──

      case 'save-progress':
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(msg.state));
        } catch { /* quota exceeded — ignore */ }
        break;

      case 'load-progress': {
        let state = null;
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) state = JSON.parse(saved);
        } catch { /* corrupt data — ignore */ }
        reply('progress-loaded', { state });
        break;
      }

      case 'clear-progress':
        localStorage.removeItem(STORAGE_KEY);
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

          // Fallback until eCommerce is set up: just mark as draft and confirm
          reply('checkout-ready', { checkoutUrl: null });
        } catch (err) {
          reply('checkout-error', { error: err.message });
        }
        break;
      }

      // ── Admin Settings ──

      case 'save-settings': {
        const { pricing, constraints } = msg;
        try {
          // Upsert the single admin settings row
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

      // ── Legacy / existing messages (pass-through) ──
      case 'ready':
      case 'resize':
      case 'step-change':
      case 'order-submit':
      case 'config-save':
        // These are handled by the HtmlComponent or are outbound-only
        break;
    }
  });
});
