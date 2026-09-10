import { Suspense } from "react";
import WhoAmIForm from "../../components/WhoAmIForm";
import { listRecords, TABLES, STAFF_FIELDS } from "../../lib/airtable";

export const dynamic = "force-dynamic";

async function StaffPicker() {
  const staff = await listRecords(TABLES.staff);
  const options = staff
    .map((s) => ({ id: s.id, name: s.fields[STAFF_FIELDS.name] || "" }))
    .filter((s) => s.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="loginWrap">
      <h1>Who are you?</h1>
      <p>So work orders get credited to the right person.</p>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <WhoAmIForm staff={options} />
      </div>
    </div>
  );
}

export default function WhoPage() {
  return (
    <Suspense fallback={null}>
      <StaffPicker />
    </Suspense>
  );
}
