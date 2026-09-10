import TopBar from "../../../components/TopBar";
import NewWorkOrderForm from "../../../components/NewWorkOrderForm";
import {
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  STAFF_FIELDS,
} from "../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function NewWorkOrderPage() {
  const [games, staff] = await Promise.all([
    listRecords(TABLES.inventory, {
      filterByFormula: `{Status} != "Sold"`,
    }),
    listRecords(TABLES.staff),
  ]);

  const gameOptions = games
    .map((g) => ({
      id: g.id,
      title: g.fields[INVENTORY_FIELDS.title] || "(untitled)",
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const staffOptions = staff
    .map((s) => ({ id: s.id, name: s.fields[STAFF_FIELDS.name] || "" }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <TopBar backHref="/work-orders" />
      <div className="content">
        <h1 className="pageTitle">New Work Order</h1>
        <p className="pageSub">
          Log repair work, or flag something for staff to check.
        </p>
        <NewWorkOrderForm games={gameOptions} staff={staffOptions} isBoss={false} />
      </div>
    </>
  );
}
