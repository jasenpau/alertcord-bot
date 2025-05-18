import Database from 'better-sqlite3';
import {Alert} from "@/data/models/alert.js";

const db = new Database('alertcord-db.sqlite');

export function initializeDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      keywords TEXT NOT NULL,
      notify_price REAL,
      urgent_notify_price REAL
    )
  `).run();
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

  const query = db.prepare<[string], Alert>('SELECT * FROM alerts WHERE name = ?');
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
    alert.urgent_notify_price === undefined ? null : alert.urgent_notify_price
  );
}

export function deleteAlertByIdOrName(id: number | null, name: string | null): boolean {
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

export function updateAlert(id: number, updates: Partial<Omit<Alert, 'id'>>): boolean {
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
