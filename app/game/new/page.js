import TopBar from "../../../components/TopBar";
import NewGameForm from "../../../components/NewGameForm";
import {
  listRecords,
  TABLES,
  CONSIGNOR_FIELDS,
  CUSTOMER_FIELDS,
} from "../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function NewGamePage() {
  const [consignors, customers] = await Promise.all([
    listRecords(TABLES.consignors),
    listRecords(TABLES.customers),
  ]);

  const consignorOptions = consignors
    .map((c) => ({
      id: c.id,
      name: c.fields[CONSIGNOR_FIELDS.name] || "(unnamed)",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const customerOptions = customers
    .map((c) => ({
      id: c.id,
      name: c.fields[CUSTOMER_FIELDS.name] || "(unnamed)",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <TopBar backHref="/board" />
      <div className="content">
        <h1 className="pageTitle">Add a Game</h1>
        <p className="pageSub">
          Quick intake — full inspection happens as a separate step.
        </p>
        <NewGameForm consignors={consignorOptions} customers={customerOptions} />
      </div>
    </>
  );
}
