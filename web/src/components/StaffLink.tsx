import Link from "next/link";
import { Icons } from "./icons";
import { getStaff } from "@/lib/admin";

/* The ops console entry — rendered only for moderators and admins, so members
   never see a door they can't open. */
export default async function StaffLink() {
  const staff = await getStaff().catch(() => null);
  if (!staff) return null;
  return (
    <Link
      href="/admin"
      className="iconbtn"
      title={`Operations (${staff.role})`}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent-text)" }}
    >
      <Icons.shield size={17} />
    </Link>
  );
}
