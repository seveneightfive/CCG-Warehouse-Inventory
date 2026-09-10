import Link from "next/link";
import TopBar from "../../components/TopBar";
import {
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  CONSIGNOR_FIELDS,
} from "../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function LabelsPage() {
  const [records, consignors] = await Promise.all([
    listRecords(TABLES.inventory),
    listRecords(TABLES.consignors),
  ]);

  const codeToName = {};
  consignors.forEach((c) => {
    const code = c.fields[CONSIGNOR_FIELDS.code];
    if (code) codeToName[code] = c.fields[CONSIGNOR_FIELDS.name];
  });

  const groups = {};
  records.forEach((r) => {
    const prefix = r.fields[INVENTORY_FIELDS.skuPrefix];
    if (!prefix) return;
    if (!groups[prefix]) groups[prefix] = { total: 0, unprinted: 0 };
    groups[prefix].total += 1;
    if (!r.fields[INVENTORY_FIELDS.labelPrinted]) groups[prefix].unprinted += 1;
  });

  const prefixes = Object.keys(groups).sort();

  return (
    <>
      <TopBar backHref="/dashboard" />
      <div className="content">
        <h1 className="pageTitle">Print Labels</h1>
        <p className="pageSub">
          Avery 5160 sheets, 30 per page. Pick a prefix to print its next batch.
        </p>

        {prefixes.length === 0 && (
          <div className="emptyState">No inventory yet.</div>
        )}

        {prefixes.map((prefix) => {
          const g = groups[prefix];
          const label = codeToName[prefix]
            ? `${codeToName[prefix]} (${prefix})`
            : prefix === "CCG"
            ? "CCG (in-house)"
            : prefix;
          return (
            <Link key={prefix} href={`/labels/print/${prefix}`} className="card">
              <div className="title">{label}</div>
              <div className="meta">
                <span>{g.total} total</span>
                <span>
                  {g.unprinted > 0
                    ? `${g.unprinted} not yet printed`
                    : "all printed"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
