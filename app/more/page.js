import Link from "next/link";
import TopBar from "../../components/TopBar";

const ITEMS = [
  { href: "/consignors", label: "Consignors", sub: "See whose games are whose" },
  { href: "/suppliers", label: "Suppliers", sub: "Contacts & what they supply" },
  { href: "/locations", label: "Locations", sub: "Browse games by venue" },
  { href: "/purchase-orders/new", label: "New Purchase Order", sub: "Log a parts purchase" },
  { href: "/labels", label: "Print Labels", sub: "QR sticker sheets" },
  { href: "/parts", label: "Parts & Supplies", sub: "Stock & add new parts" },
];

export default function MorePage() {
  return (
    <>
      <TopBar title="More" backHref="/dashboard" backLabel="Home" />
      <div className="content">
        <div className="navGrid">
          {ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              <small>{item.sub}</small>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}