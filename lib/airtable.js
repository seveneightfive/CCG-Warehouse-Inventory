const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_ROOT = "https://api.airtable.com/v0";

// ---- Table IDs (stable, safe to use directly in the URL path) ----

export const TABLES = {
  inventory: "tblLsyFXz7x1oNx0K",
  workOrders: "tblDigjae9At2GBNV",
  parts: "tblyWcZ9D7TYG76rk",
  consignors: "tblFTefrM5qx7qIRC",
  staff: "tblr5OB8VLKFaQqLv",
  locations: "tbldVtpluJIR4YIiX",
};

// ---- Field NAMES (the plain REST API reads/writes fields by name,
// not by field ID) ----

export const INVENTORY_FIELDS = {
  title: "Title",
  dateReceived: "Date Received",
  consignor: "Consignor / Owner",
  labelNumber: "Label #",
  sku: "SKU",
  description: "Item Description",
  status: "Status",
  photo: "Game Photo",
  workOrders: "Work Orders 2",
  location: "Location (Linked)",
  dateSold: "Date Sold",
  buyerName: "Buyer Name",
  buyerPhone: "Buyer Phone",
  pickedUpDate: "Picked Up Date",
  daysAwaitingPickup: "Days Awaiting Pickup",
  lastUpdatedBy: "Last Updated By",
};

export const STATUS_CHOICES = [
  { name: "Just Received" },
  { name: "In Progress" },
  { name: "In Repair" },
  { name: "Ready for Auction" },
  { name: "Going to Auction" },
  { name: "Sale Ready" },
  { name: "Project Only" },
  { name: "On Route" },
  { name: "On Location" },
  { name: "Sold - Awaiting Pickup" },
  { name: "Sold" },
];

export const WORK_ORDER_FIELDS = {
  woId: "Work Order ID",
  date: "Date",
  staff: "CCGM Staff",
  notes: "Notes of Work",
  laborHours: "Labor Hours",
  partsUsed: "Parts Used",
  totalCost: "Total Cost",
  status: "Status",
  image: "WO Image",
  inventoryLink: "Inventory copy",
  flaggedByBoss: "Flagged by Boss",
  itemLocation: "Item Location",
  lastUpdatedBy: "Last Updated By",
};

export const WORK_ORDER_STATUS_CHOICES = [
  { name: "Just Assigned" },
  { name: "In progress" },
  { name: "Delayed" },
  { name: "Complete" },
];

export const CONSIGNOR_FIELDS = {
  name: "Consignor Name",
  code: "Consignor Code",
};

export const STAFF_FIELDS = {
  name: "CCGM Staff Name",
};

export const LOCATION_FIELDS = {
  name: "Location Name",
};

export const PART_FIELDS = {
  name: "Part Name",
};

// ---- Low-level request helper ----

async function airtableRequest(path, options = {}) {
  if (!TOKEN || !BASE_ID) {
    throw new Error(
      "Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables."
    );
  }
  const res = await fetch(`${API_ROOT}/${BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable ${res.status}: ${body}`);
  }
  return res.json();
}

// ---- Records ----

export async function listRecords(tableId, { filterByFormula, view } = {}) {
  const params = new URLSearchParams();
  if (filterByFormula) params.set("filterByFormula", filterByFormula);
  if (view) params.set("view", view);
  params.set("pageSize", "100");

  let records = [];
  let offset;
  do {
    if (offset) params.set("offset", offset);
    const data = await airtableRequest(`${tableId}?${params.toString()}`);
    records = records.concat(data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

export async function getRecord(tableId, recordId) {
  return airtableRequest(`${tableId}/${recordId}`);
}

export async function createRecord(tableId, fields) {
  return airtableRequest(tableId, {
    method: "POST",
    body: JSON.stringify({ fields, typecast: true }),
  });
}

export async function updateRecord(tableId, recordId, fields) {
  return airtableRequest(`${tableId}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields, typecast: true }),
  });
}
