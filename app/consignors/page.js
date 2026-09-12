import Link from "next/link";
import TopBar from "../../components/TopBar";
import { listRecords, TABLES, CONSIGNOR_FIELDS } from "../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function ConsignorsPage() {
  const consignors = await listRecords(TABLES.consignors);
  consignors.sort((a, b) =>
    (a.fields[CONSIGNOR_FIELDS.name] || "").localeCompare(b.fields[CONSIGNOR_FIELDS.name] || "")
  );

  return (
    <>
      <TopBar title="Consignors" backHref="/more" backLabel="More" />
      <div className="content">
        <p className="pageSub">{consignors.length} consignors on file</p>

        {consignors.length === 0 && <div className="emptyState">No consignors yet.</div>}

        {consignors.map((c) => {
          const f = c.fields;
          const count = f[CONSIGNOR_FIELDS.totalItems] || 0;
          return (
            <Link key={c.id} href={`/consignors/${c.id}`} className="card">
              <div className="sku">{f[CONSIGNOR_FIELDS.code]}</div>
              <div className="title">{f[CONSIGNOR_FIELDS.name]}</div>
              <div className="meta">
                <span>{count} item{count === 1 ? "" : "s"}</span>
                {f[CONSIGNOR_FIELDS.phone] && <span>{f[CONSIGNOR_FIELDS.phone]}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}