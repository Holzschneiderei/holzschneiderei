/**
 * CMS sync: fetches Wix CMS collection schemas (and optionally data)
 * via REST API and writes CSV files to cms/.
 *
 * Env:  WIX_API_KEY, WIX_SITE_ID
 * Flag: --include-data (optional, default: headers only)
 *
 * Run: npx tsx scripts/cms-sync.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const cmsDir = join(import.meta.dirname, '..', 'cms');

const COLLECTIONS = [
  'Garderobe+Bestellungen',
  'Konfigurationen',
  'ConfiguratorAdmin',
] as const;

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

if (!API_KEY || !SITE_ID) {
  console.error('Missing WIX_API_KEY or WIX_SITE_ID environment variables.');
  process.exit(1);
}

const includeData = process.argv.includes('--include-data');

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ---------------------------------------------------------------------------
// Wix API helpers
// ---------------------------------------------------------------------------

function headers(): Record<string, string> {
  return {
    'Authorization': API_KEY!,
    'wix-site-id': SITE_ID!,
    'Content-Type': 'application/json',
  };
}

interface WixField {
  key: string;
  type: string;
}

interface CollectionResponse {
  collection: {
    fields: WixField[];
  };
}

interface DataItem {
  data: Record<string, unknown>;
}

interface QueryResponse {
  dataItems: DataItem[];
}

async function fetchSchema(collectionId: string): Promise<WixField[]> {
  const url = `https://www.wixapis.com/wix-data/v2/collections/${encodeURIComponent(collectionId)}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`Schema fetch failed for ${collectionId}: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as CollectionResponse;
  return body.collection.fields;
}

async function fetchData(collectionId: string): Promise<DataItem[]> {
  const url = 'https://www.wixapis.com/wix-data/v2/items/query';
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      dataCollectionId: collectionId,
      query: { paging: { limit: 50 } },
    }),
  });
  if (!res.ok) {
    throw new Error(`Data fetch failed for ${collectionId}: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as QueryResponse;
  return body.dataItems ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function sync(): Promise<void> {
  mkdirSync(cmsDir, { recursive: true });

  for (const collectionId of COLLECTIONS) {
    console.log(`  ${collectionId}`);

    const fields = await fetchSchema(collectionId);
    const fieldKeys = fields.map((f) => f.key);

    let csv = fieldKeys.map(escapeCsv).join(',') + '\n';

    if (includeData) {
      const items = await fetchData(collectionId);
      for (const item of items) {
        const row = fieldKeys.map((key) => escapeCsv(item.data[key]));
        csv += row.join(',') + '\n';
      }
      console.log(`    ${items.length} row(s)`);
    }

    const outPath = join(cmsDir, `${collectionId}.csv`);
    writeFileSync(outPath, csv, 'utf-8');
    console.log(`    -> ${outPath}`);
  }
}

console.log('\nCMS sync\n');
sync()
  .then(() => console.log('\n  done\n'))
  .catch((err) => {
    console.error('\n  error:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
