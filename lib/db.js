import Dexie from "dexie";

export const db = new Dexie("ccgWarehouse");

db.version(1).stores({
  // local cache of server records, keyed by Airtable record id
  inventory: "id, status, sku",
  workOrders: "id, status",
  consignors: "id",
  locations: "id",
  staff: "id",
  customers: "id",

  // queued writes made while offline, drained when back online
  outbox: "++localId, kind, createdAt",
});