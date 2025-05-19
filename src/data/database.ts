import Database from 'better-sqlite3';
import { Alert } from '@/data/models/alert.js';
import { Listing } from '@/data/models/listing.js';
import { ListingContext } from '@/data/models/listingContext.js';

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
      fullDescription TEXT,
      processedOn TEXT,
      processingResult INTEGER
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

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS listing_context (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER NOT NULL,
      isSelling BOOLEAN NOT NULL,
      isDesktopComputer BOOLEAN NOT NULL,
      isGpuOnly BOOLEAN NOT NULL,
      actualGpu TEXT NOT NULL,
      specs TEXT,
      price REAL,
      FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE
    )
  `,
  ).run();

  // Create unique index to ensure one context per listing
  db.prepare(
    `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_context_listingId ON listing_context(listingId)
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
    INSERT OR IGNORE INTO listings (externalId, title, price, link, location, description, fullDescription, processedOn, processingResult)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  query.run(
    listing.externalId,
    listing.title,
    listing.price === undefined ? null : listing.price,
    listing.link,
    listing.location || null,
    listing.description || null,
    listing.fullDescription || null,
    listing.processedOn?.toISOString() || null,
    listing.processingResult || null,
  );
}

export function addListings(listings: Omit<Listing, 'id'>[]): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO listings (externalId, title, price, link, location, description, fullDescription, processedOn, processingResult)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        listing.fullDescription || null,
        listing.processedOn?.toISOString() || null,
        listing.processingResult || null,
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

export function getListingById(id: number): Listing | null {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare<[number], any>(
    'SELECT * FROM listings WHERE id = ?',
  );
  const result = query.get(id);

  if (!result) return null;

  return {
    ...result,
    processedOn: result.processedOn ? new Date(result.processedOn) : null,
  };
}

export function updateListing(
  id: number,
  updates: Partial<Omit<Listing, 'id'>>,
): boolean {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const existingListing = db
    .prepare('SELECT * FROM listings WHERE id = ?')
    .get(id);
  if (!existingListing) {
    return false;
  }

  const setParts: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    setParts.push('title = ?');
    values.push(updates.title);
  }
  if (updates.price !== undefined) {
    setParts.push('price = ?');
    values.push(updates.price);
  }
  if (updates.link !== undefined) {
    setParts.push('link = ?');
    values.push(updates.link);
  }
  if (updates.location !== undefined) {
    setParts.push('location = ?');
    values.push(updates.location);
  }
  if (updates.description !== undefined) {
    setParts.push('description = ?');
    values.push(updates.description);
  }
  if (updates.fullDescription !== undefined) {
    setParts.push('fullDescription = ?');
    values.push(updates.fullDescription);
  }
  if (updates.processedOn !== undefined && updates.processingResult !== null) {
    setParts.push('processedOn = ?');
    values.push(updates.processedOn?.toISOString() || null);
  }
  if (
    updates.processingResult !== undefined &&
    updates.processingResult !== null
  ) {
    setParts.push('processingResult = ?');
    values.push(updates.processingResult || null);
  }

  if (setParts.length === 0) {
    return false;
  }

  console.log('setParts', setParts, values);

  values.push(id);
  const query = db.prepare(`
    UPDATE listings 
    SET ${setParts.join(', ')}
    WHERE id = ?
  `);

  return query.run(...values).changes > 0;
}

export function getFilteredKeywords(): { id: number; keyword: string }[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare('SELECT * FROM filtered_keywords ORDER BY keyword');
  // @ts-ignore
  return query.all();
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

export function getUnprocessedListings(): Listing[] {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare(`
    SELECT * FROM listings
    WHERE processingResult IS NULL
  `);
  const results = query.all();

  return results.map((row) => ({
    // @ts-ignore
    ...row,
    // @ts-ignore
    processedOn: row.processedOn ? new Date(row.processedOn) : null,
  }));
}

export function hasListingContext(listingId: number): boolean {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare('SELECT 1 FROM listing_context WHERE listingId = ?');
  const result = query.get(listingId);

  return result !== undefined;
}

export function getListingContext(listingId: number): ListingContext | null {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const query = db.prepare('SELECT * FROM listing_context WHERE listingId = ?');
  const result = query.get(listingId);

  // @ts-ignore
  return result || null;
}

export function addOrUpdateListingContext(context: ListingContext): boolean {
  if (!db) {
    throw new Error('Database not initialized');
  }

  // Check if the referenced listing exists
  const listingExists = db
    .prepare('SELECT 1 FROM listings WHERE id = ?')
    .get(context.listingId);
  if (!listingExists) {
    throw new Error(`Listing with ID ${context.listingId} does not exist`);
  }

  // Check if context already exists for this listing
  const existingContext = hasListingContext(context.listingId);

  if (existingContext) {
    // Update existing context
    const query = db.prepare(`
      UPDATE listing_context
      SET isSelling = ?,
          isDesktopComputer = ?,
          isGpuOnly = ?,
          actualGpu = ?,
          specs = ?,
          price = ?
      WHERE listingId = ?
    `);

    const result = query.run(
      context.isSelling ? 1 : 0,
      context.isDesktopComputer ? 1 : 0,
      context.isGpuOnly ? 1 : 0,
      context.actualGpu,
      context.specs || null,
      context.price || null,
      context.listingId,
    );

    return result.changes > 0;
  } else {
    // Insert new context
    const query = db.prepare(`
      INSERT INTO listing_context (
        listingId, isSelling, isDesktopComputer, isGpuOnly, actualGpu, specs, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = query.run(
      context.listingId,
      context.isSelling ? 1 : 0,
      context.isDesktopComputer ? 1 : 0,
      context.isGpuOnly ? 1 : 0,
      context.actualGpu,
      context.specs || null,
      context.price || null,
    );

    return result.changes > 0;
  }
}
