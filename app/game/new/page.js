import TopBar from "../../../components/TopBar";
import NewGameForm from "../../../components/NewGameForm";
import { listRecords, TABLES, CONSIGNOR_FIELDS } from "../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function NewGamePage() {
  const consignors = await listRecords(TABLES.consignors);
  const options = consignors
    .map((c) => ({
      id: c.id,
      name: c.fields[CONSIGNOR_FIELDS.name] || "(unnamed)",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <TopBar backHref="/board" />
      <div className="content">
        <h1 className="pageTitle">Add a Game</h1>
        <p className="pageSub">
          For a game that already has its label sticker on it.
        </p>
        <NewGameForm consignors={options} />
      </div>
    </>
  );
}
