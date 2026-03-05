/**
 * Wix Velo Backend Events — backend/events.js
 *
 * Create this file in the Wix Editor under Backend > events.js
 * This auto-updates the configuration status when a payment completes.
 */

import wixData from 'wix-data';

export function wixEcom_onOrderCreated(event) {
  const order = event.entity;
  const checkoutId = order.checkoutId;

  if (!checkoutId) return;

  return wixData.query('Konfigurationen')
    .eq('checkoutId', checkoutId)
    .find()
    .then(results => {
      if (results.items.length > 0) {
        const item = results.items[0];
        item.status = 'paid';
        return wixData.update('Konfigurationen', item);
      }
    })
    .catch(err => {
      console.error('Failed to update config status after payment:', err);
    });
}
