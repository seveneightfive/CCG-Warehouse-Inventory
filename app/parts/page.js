import Link from "next/link";
import TopBar from "../../components/TopBar";
import { listRecords, TABLES, PART_FIELDS } from "../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function PartsPage() {
  const parts = await listRecords(TABLES.parts);
  parts.sort((a, b) =>
    (a.fields[PART_FIELDS.name] || "").localeCompare(b.fields[PART_FIELDS.name] || "")
  );

  return (
    <>
      <TopBar title="Parts & Supplies" backHref="/dashboard" backLabel="Dashboard" />
      <div className="content">
        <p className="pageSub">{parts.length} parts on file</p>

        {parts.length === 0 && <div className="emptyState">No parts yet.</div>}

        {parts.map((p) => {
          const f = p.fields;
          const stock = f[PART_FIELDS.inStock];
          const low = typeof stock === "number" && stock <= 2;
          return (
            <div
              key={p.id}
              className="card"
              style={{ borderLeftColor: low ? "#C0392B" : "#12798a" }}
            >
              <div className="sku">{f[PART_FIELDS.partId]}</div>
              <div className="title">{f[PART_FIELDS.name]}</div>
              <div className="meta">
                <span>{f[PART_FIELDS.category]}</span>
                <span>{stock ?? 0} in stock{low ? " — low" : ""}</span>
                {f[PART_FIELDS.location] && <span>{f[PART_FIELDS.location]}</span>}
              </div>
            </div>
          );
        })}

        <Link href="/parts/new" className="btn fab">
          + Add Parts
        </Link>
      </div>
    </>
  );
}
