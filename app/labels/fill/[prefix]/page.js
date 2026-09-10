import Link from "next/link";
import TopBar from "../../../../components/TopBar";
import { listRecords, TABLES, INVENTORY_FIELDS } from "../../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function FillPrefixPage({ params }) {
  const prefix = decodeURIComponent(params.prefix);
  const records = await listRecords(TABLES.inventory, {
    filterByFormula: `AND({SKU Prefix} = "${prefix}", {Placeholder} = 1)`,
  });
  records.sort(
    (a, b) =>
      (a.fields[INVENTORY_FIELDS.labelNumber] || 0) -
      (b.fields[INVENTORY_FIELDS.labelNumber] || 0)
  );

  return (
    <>
      <TopBar title={prefix} backHref="/labels/fill" backLabel="Fill In Games" />
      <div className="content">
        <h1 className="pageTitle">{prefix}</h1>
        <p className="pageSub">
          Tap the label number on the sticker you just put on the game.
        </p>

        {records.length === 0 && (
          <div className="emptyState">All filled in for this batch.</div>
        )}

        {records.map((r) => (
          <Link key={r.id} href={`/game/${r.id}`} className="card">
            <div className="title">Label #{r.fields[INVENTORY_FIELDS.labelNumber]}</div>
            <div className="meta">
              <span>Tap to enter this game's details</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
