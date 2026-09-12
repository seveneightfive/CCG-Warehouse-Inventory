import { db } from "./db";

export async function pullFromServer() {
  const res = await fetch("/api/inventory");
  if (!res.ok) return;
  const { records } = await res.json();
  await db.inventory.bulkPut(records); // records already have `.id`
  // repeat for work orders, consignors, locations, etc.
}

export async function pushOutbox() {
  const queued = await db.outbox.orderBy("createdAt").toArray();
  for (const item of queued) {
    try {
      if (item.kind === "patch") {
        const res = await fetch(`/api/${item.table}/${item.recordId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.fields),
        });
        if (!res.ok) throw new Error(await res.text());
      } else if (item.kind === "create") {
        const res = await fetch(`/api/${item.table}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.fields),
        });
        if (!res.ok) throw new Error(await res.text());
        const { record } = await res.json();
        // swap the temp local id for the real Airtable id everywhere it's cached
        await db.inventory.delete(item.tempId);
        await db.inventory.put(record);
      }
      await db.outbox.delete(item.localId); // success — remove from queue
    } catch {
      break; // still offline or server error — stop, try again later
    }
  }
}

export function startSync() {
  window.addEventListener("online", () => pushOutbox().then(pullFromServer));
  window.addEventListener("offline", () => {});
  if (navigator.onLine) pullFromServer();
  setInterval(() => {
    if (navigator.onLine) pushOutbox().then(pullFromServer);
  }, 30000);
}