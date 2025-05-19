import Database from 'better-sqlite3';
import { Alert } from '@/data/models/alert.js';
import { Listing } from '@/data/models/listing.js';

const db = new Database('alertcord-db.sqlite');

export function initializeDatabase() {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      keywords TEXT NOT NULL,
      notify_price REAL,
      urgent_notify_price REAL
    )
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      externalId TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      price REAL,
      link TEXT NOT NULL,
      location TEXT,
      description TEXT,
      processedOn TEXT
    )
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS filtered_keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT UNIQUE NOT NULL
    )
  `,
  ).run();
}

export function getAlerts(): Alert[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare<[], Alert>('SELECT * FROM alerts');
  return query.all();
}

export function getAlertByName(name: string): Alert | undefined {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare<[string], Alert>(
    'SELECT * FROM alerts WHERE name = ?',
  );
  return query.get(name);
}

export function addAlert(alert: Omit<Alert, 'id'>): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const existingAlert = getAlertByName(alert.name);
  if (existingAlert) {
    throw new Error('DUPLICATE_ALERT');
  }

  const query = db.prepare(`
    INSERT INTO alerts (name, keywords, notify_price, urgent_notify_price)
    VALUES (?, ?, ?, ?)
  `);
  query.run(
    alert.name,
    alert.keywords,
    alert.notify_price === undefined ? null : alert.notify_price,
    alert.urgent_notify_price === undefined ? null : alert.urgent_notify_price,
  );
}

export function deleteAlertByIdOrName(
  id: number | null,
  name: string | null,
): boolean {
  if (!db) {
    throw new Error('Database not initialized');
  }

  let query;
  if (id) {
    query = db.prepare('DELETE FROM alerts WHERE id = ?');
    return query.run(id).changes > 0;
  } else if (name) {
    query = db.prepare('DELETE FROM alerts WHERE name = ?');
    return query.run(name).changes > 0;
  }

  return false;
}

export function updateAlert(
  id: number,
  updates: Partial<Omit<Alert, 'id'>>,
): boolean {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const existingAlert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
  if (!existingAlert) {
    return false;
  }

  const setParts: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    setParts.push('name = ?');
    values.push(updates.name);
  }
  if (updates.keywords !== undefined) {
    setParts.push('keywords = ?');
    values.push(updates.keywords);
  }
  if (updates.notify_price !== undefined) {
    setParts.push('notify_price = ?');
    values.push(updates.notify_price);
  }
  if (updates.urgent_notify_price !== undefined) {
    setParts.push('urgent_notify_price = ?');
    values.push(updates.urgent_notify_price);
  }

  if (setParts.length === 0) {
    return false;
  }

  values.push(id);
  const query = db.prepare(`
    UPDATE alerts 
    SET ${setParts.join(', ')}
    WHERE id = ?
  `);

  return query.run(...values).changes > 0;
}

export function addListing(listing: Omit<Listing, 'id'>): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare(`
    INSERT OR IGNORE INTO listings (externalId, title, price, link, location, description, processedOn)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  query.run(
    listing.externalId,
    listing.title,
    listing.price === undefined ? null : listing.price,
    listing.link,
    listing.location || null,
    listing.description || null,
    listing.processedOn?.toISOString() || null,
  );
}

export function addListings(listings: Omit<Listing, 'id'>[]): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO listings (externalId, title, price, link, location, description, processedOn)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((listings) => {
    for (const listing of listings) {
      insert.run(
        listing.externalId,
        listing.title,
        listing.price === undefined ? null : listing.price,
        listing.link,
        listing.location || null,
        listing.description || null,
        listing.processedOn?.toISOString() || null,
      );
    }
  });

  insertMany(listings);
}

export function getListings(): Listing[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare(`SELECT * FROM listings`);
  const results = query.all();

  return results.map((row) => ({
    // @ts-ignore
    ...row,
    // @ts-ignore
    processedOn: row.processedOn ? new Date(row.processedOn) : null,
  }));
}

export function getListingByExternalId(
  externalId: string,
): Listing | undefined {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare<[string], any>(
    'SELECT * FROM listings WHERE externalId = ?',
  );
  const result = query.get(externalId);

  if (!result) return undefined;

  return {
    ...result,
    processedOn: new Date(result.processedOn),
  };
}

export function getFilteredKeywords(): { id: number; keyword: string }[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare('SELECT * FROM filtered_keywords ORDER BY keyword');
  // @ts-ignore
  return query.all();
}

export function addFilteredKeyword(keyword: string): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare(
    'INSERT OR IGNORE INTO filtered_keywords (keyword) VALUES (?)',
  );
  query.run(keyword.trim());
}

export function addFilteredKeywords(keywords: string[]): { added: number } {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const insert = db.prepare(
    'INSERT OR IGNORE INTO filtered_keywords (keyword) VALUES (?)',
  );
  let added = 0;

  const transaction = db.transaction((keywords) => {
    for (const keyword of keywords) {
      const result = insert.run(keyword.trim());
      if (result.changes > 0) added++;
    }
  });

  transaction(keywords);
  return { added };
}

export function deleteFilteredKeywordByName(keyword: string): boolean {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare('DELETE FROM filtered_keywords WHERE keyword = ?');
  return query.run(keyword.trim()).changes > 0;
}
