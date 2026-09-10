const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const API_ROOT = "https://api.airtable.com/v0";
const CONTENT_API_ROOT = "https://content.airtable.com/v0";

// ---- Table IDs (stable, safe to use directly in the URL path) ----

export const TABLES = {
  inventory: "tblLsyFXz7x1oNx0K",
  workOrders: "tblDigjae9At2GBNV",
  parts: "tblyWcZ9D7TYG76rk",
  consignors: "tblFTefrM5qx7qIRC",
  staff: "tblr5OB8VLKFaQqLv",
  locations: "tbldVtpluJIR4YIiX",
  customers: "tblE3FFW7eUelcrFT",
};

// ---- Field NAMES (the plain REST API reads/writes fields by name,
// not by field ID) ----

export const INVENTORY_FIELDS = {
  title: "Title",
  dateReceived: "Date Received",
  consignor: "Consignor / Owner",
  labelNumber: "Label #",
  sku: "SKU",
  skuPrefix: "SKU Prefix",
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
  sourceType: "Source Type",
  customer: "Customer",
  purchasedFrom: "Purchased From",
  condition: "Condition",
  dedicatedCabinet: "Dedicated Cabinet",
  conditionNotes: "Condition Notes",
  brand: "Brand / Manufacturer",
  serialNumber: "Serial #",
  inspectionComplete: "Inspection Complete",
  labelPrinted: "Label Printed",
  inspectionOutcome: "Inspection Outcome",
};

export const INSPECTION_OUTCOME_CHOICES = [
  "Needs Attention",
  "Ready to Clean & Photograph",
];

export const SOURCE_TYPE_CHOICES = [
  "Consignment",
  "In-House Purchase",
  "Customer Repair",
];

export const BRAND_CHOICES = [
  "Williams",
  "Bally",
  "Midway",
  "Namco",
  "Sega",
  "Atari",
  "Capcom",
  "Stern",
  "Data East",
  "Taito",
  "Konami",
  "Gottlieb",
  "SNK",
  "Chicago Coin",
  "ICE",
  "Other",
];

export const STATUS_CHOICES = [
  { name: "Just Received" },
  { name: "In Progress" },
  { name: "In Repair" },
  { name: "Ready for Auction" },
  { name: "Going to Auction" },
  { name: "Sale Ready" },
  { name: "Project Only" },
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

export const CUSTOMER_FIELDS = {
  name: "Name",
  email: "Email",
  phone: "Phone Number",
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

export async function updateRecordsBatch(tableId, records) {
  // records: [{ id, fields }], max 10 per Airtable's API limit
  const chunks = [];
  for (let i = 0; i < records.length; i += 10) {
    chunks.push(records.slice(i, i + 10));
  }
  const results = [];
  for (const chunk of chunks) {
    const data = await airtableRequest(tableId, {
      method: "PATCH",
      body: JSON.stringify({ records: chunk, typecast: true }),
    });
    results.push(...data.records);
  }
  return results;
}

// ---- Attachments (separate host + auth flow from normal records) ----

export async function uploadAttachment(recordId, fieldName, base64, contentType, filename) {
  if (!TOKEN || !BASE_ID) {
    throw new Error(
      "Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables."
    );
  }
  const res = await fetch(
    `${CONTENT_API_ROOT}/${BASE_ID}/${recordId}/${encodeURIComponent(fieldName)}/uploadAttachment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType,
        file: base64,
        filename,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable upload ${res.status}: ${body}`);
  }
  return res.json();
}

// ---- Name-resolution helpers ----
// Link fields return raw record IDs from the plain REST API, not names.
// Build an id->name map once per page, then resolve with this.

export function buildNameMap(records, nameField) {
  const map = {};
  for (const r of records) {
    map[r.id] = r.fields[nameField] || "(unnamed)";
  }
  return map;
}

export function resolveNames(rawValue, map) {
  const flat = [];
  const flatten = (v) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) {
      v.forEach(flatten);
    } else if (typeof v === "object") {
      flat.push(v.id || v.name || JSON.stringify(v));
    } else {
      flat.push(String(v));
    }
  };
  flatten(rawValue);
  return flat.map((id) => map[id] || id);
}
