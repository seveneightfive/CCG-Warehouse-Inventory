import Link from "next/link";
import TopBar from "../../../components/TopBar";
import {
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  CONSIGNOR_FIELDS,
} from "../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function FillIndexPage() {
  const [records, consignors] = await Promise.all([
    listRecords(TABLES.inventory, {
      filterByFormula: `{Placeholder} = 1`,
    }),
    listRecords(TABLES.consignors),
  ]);

  const nameByCode = {};
  consignors.forEach((c) => {
    const code = c.fields[CONSIGNOR_FIELDS.code];
    if (code) nameByCode[code] = c.fields[CONSIGNOR_FIELDS.name];
  });

  const counts = {};
  records.forEach((r) => {
    const prefix = r.fields[INVENTORY_FIELDS.skuPrefix];
    if (!prefix) return;
    counts[prefix] = (counts[prefix] || 0) + 1;
  });

  const prefixes = Object.keys(counts).sort();

  return (
    <>
      <TopBar backHref="/labels" backLabel="← Labels" />
      <div className="content">
        <h1 className="pageTitle">Fill In Games</h1>
        <p className="pageSub">Pick who these games came in from.</p>

        {prefixes.length === 0 && (
          <div className="emptyState">
            No blank labels waiting to be filled in.
          </div>
        )}

        {prefixes.map((prefix) => (
          <Link key={prefix} href={`/labels/fill/${prefix}`} className="card">
            <div className="title">
              {nameByCode[prefix] || (prefix === "CCG" ? "CCG (in-house)" : prefix)}
            </div>
            <div className="meta">
              <span>{counts[prefix]} blank label{counts[prefix] === 1 ? "" : "s"}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
