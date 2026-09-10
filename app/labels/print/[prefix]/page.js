import QRCode from "qrcode";
import { headers } from "next/headers";
import PrintControls from "../../../../components/PrintControls";
import {
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  CONSIGNOR_FIELDS,
} from "../../../../lib/airtable";

export const dynamic = "force-dynamic";

function getBaseUrl() {
  const h = headers();
  const host = h.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export default async function PrintLabelsPage({ params }) {
  const prefix = decodeURIComponent(params.prefix);
  const baseUrl = getBaseUrl();

  const [records, consignors] = await Promise.all([
    listRecords(TABLES.inventory, {
      filterByFormula: `AND({SKU Prefix} = "${prefix}", {Label Printed} = 0)`,
    }),
    listRecords(TABLES.consignors),
  ]);

  records.sort(
    (a, b) =>
      (a.fields[INVENTORY_FIELDS.labelNumber] || 0) -
      (b.fields[INVENTORY_FIELDS.labelNumber] || 0)
  );
  const batch = records.slice(0, 30);

  const consignorRecord = consignors.find(
    (c) => c.fields[CONSIGNOR_FIELDS.code] === prefix
  );
  const displayName =
    consignorRecord?.fields[CONSIGNOR_FIELDS.name] ||
    (prefix === "CCG" ? "CCG (in-house)" : prefix);

  const labels = await Promise.all(
    batch.map(async (r) => {
      const url = `${baseUrl}/game/${r.id}`;
      const qr = await QRCode.toDataURL(url, { margin: 0, width: 200 });
      return {
        id: r.id,
        sku: r.fields[INVENTORY_FIELDS.sku],
        labelNumber: r.fields[INVENTORY_FIELDS.labelNumber],
        qr,
      };
    })
  );

  const remaining = records.length - batch.length;

  return (
    <>
      <style>{`
        body { border: none !important; max-width: none !important; }
        @media print {
          .printControls, .printNote { display: none !important; }
        }
        .sheet {
          width: 8.5in;
          height: 11in;
          padding: 0.5in 0.1875in;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: repeat(3, 2.625in);
          grid-template-rows: repeat(10, 1in);
          column-gap: 0.125in;
          row-gap: 0;
          background: white;
        }
        .label {
          display: flex;
          align-items: center;
          gap: 0.08in;
          padding: 0.06in 0.1in;
          overflow: hidden;
          box-sizing: border-box;
        }
        .label img {
          width: 0.85in;
          height: 0.85in;
          flex: 0 0 auto;
        }
        .label .text {
          font-family: Arial, sans-serif;
          line-height: 1.2;
          overflow: hidden;
        }
        .label .name {
          font-size: 9px;
          font-weight: bold;
        }
        .label .num {
          font-size: 12px;
        }
      `}</style>

      <div className="printNote" style={{ padding: 16, fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 20 }}>
          {displayName} — {batch.length} label{batch.length === 1 ? "" : "s"}
        </h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          Avery 5160 sheet (30 per page).{" "}
          {remaining > 0
            ? `${remaining} more waiting — run this again after printing this sheet.`
            : "This is everything unprinted for this prefix."}
        </p>
        <PrintControls recordIds={batch.map((r) => r.id)} />
      </div>

      {batch.length === 0 ? (
        <p style={{ padding: 16, fontFamily: "sans-serif" }}>
          Nothing unprinted for this prefix.
        </p>
      ) : (
        <div className="sheet">
          {labels.map((l) => (
            <div className="label" key={l.id}>
              <img src={l.qr} alt="" />
              <div className="text">
                <div className="name">{displayName}</div>
                <div className="num">#{l.labelNumber}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
