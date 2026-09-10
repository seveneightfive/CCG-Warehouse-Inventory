import Link from "next/link";
import TopBar from "../../components/TopBar";
import GenerateLabelsButton from "../../components/GenerateLabelsButton";
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

  const groups = {};
  records.forEach((r) => {
    const prefix = r.fields[INVENTORY_FIELDS.skuPrefix];
    if (!prefix) return;
    if (!groups[prefix]) groups[prefix] = { total: 0, unprinted: 0, unfilled: 0 };
    groups[prefix].total += 1;
    if (!r.fields[INVENTORY_FIELDS.labelPrinted]) groups[prefix].unprinted += 1;
    if (r.fields[INVENTORY_FIELDS.placeholder]) groups[prefix].unfilled += 1;
  });

  const rows = consignors
    .map((c) => ({
      key: c.fields[CONSIGNOR_FIELDS.code],
      name: c.fields[CONSIGNOR_FIELDS.name],
      consignorId: c.id,
    }))
    .filter((r) => r.key)
    .concat([{ key: "CCG", name: "CCG (in-house)", consignorId: null }])
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <TopBar backHref="/dashboard" />
      <div className="content">
        <h1 className="pageTitle">Print Labels</h1>
        <p className="pageSub">
          Generate a batch of labels before games arrive, print the sheet, then
          fill in titles as games come through the door.
        </p>

        <div style={{ marginBottom: 16 }}>
          <Link href="/labels/fill" className="btn flag">
            Fill in games from a printed sheet
          </Link>
        </div>

        {rows.map((row) => {
          const g = groups[row.key] || { total: 0, unprinted: 0, unfilled: 0 };
          return (
            <div key={row.key} className="card">
              <div className="title">{row.name}</div>
              <div className="meta">
                <span>{g.total} labels made</span>
                <span>{g.unfilled} not yet filled in</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <GenerateLabelsButton prefix={row.key} consignorId={row.consignorId} />
                {g.unprinted > 0 && (
                  <Link href={`/labels/print/${row.key}`} className="btn secondary">
                    Print {g.unprinted} unprinted
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
