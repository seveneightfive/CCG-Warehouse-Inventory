import TopBar from "../../../components/TopBar";
import NewPartForm from "../../../components/NewPartForm";

export const dynamic = "force-dynamic";

export default function NewPartPage() {
  return (
    <>
      <TopBar title="Add Parts" backHref="/parts" backLabel="Parts" />
      <div className="content">
        <NewPartForm />
      </div>
    </>
  );
}
