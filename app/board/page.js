import TopBar from "../../components/TopBar";
import BoardClient from "./BoardClient";

export default function BoardPage() {
  return (
    <>
      <TopBar title="Inventory" backHref="/dashboard" backLabel="Dashboard" />
      <BoardClient />
    </>
  );
}