import TopBar from "../../../components/TopBar";
import NewWorkOrderForm from "../../../components/NewWorkOrderForm";
import {
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  STAFF_FIELDS,
  PART_FIELDS,
} from "../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function NewWorkOrderPage() {
  const [games, staff, parts] = await Promise.all([
    listRecords(TABLES.inventory, {
      filterByFormula: `AND({Status} != "Sold", {Placeholder} != 1)`,
    }),
    listRecords(TABLES.staff),
    listRecords(TABLES.parts),
  ]);

  const gameOptions = games
    .map((g) => ({
      id: g.id,
      title: g.fields[INVENTORY_FIELDS.title] || "(untitled)",
      sku: g.fields[INVENTORY_FIELDS.sku] || "",
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const staffOptions = staff
    .map((s) => ({ id: s.id, name: s.fields[STAFF_FIELDS.name] || "" }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const partOptions = parts
    .map((p) => ({
      id: p.id,
      name: p.fields[PART_FIELDS.name] || "(unnamed)",
      inStock: p.fields[PART_FIELDS.inStock] ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <TopBar title="New Work Order" backHref="/work-orders" backLabel="Work Orders" />
      <div className="content">
        <h1 className="pageTitle">New Work Order</h1>
        <p className="pageSub">
          Log repair work, or flag something for staff to check.
        </p>
        <NewWorkOrderForm
          games={gameOptions}
          staff={staffOptions}
          parts={partOptions}
          isBoss={false}
        />
      </div>
    </>
  );
}
