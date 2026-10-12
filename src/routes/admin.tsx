import { createFileRoute } from "@tanstack/react-router";

import { AdminDesk } from "@/components/desk/admin-desk";
import { getDeskSession } from "@/lib/desk.functions";

export const Route = createFileRoute("/admin")({
  loader: () => getDeskSession(),
  head: () => ({
    meta: [{ title: "Desk settings" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const session = Route.useLoaderData();
  return <AdminDesk signedIn={session.signedIn} settings={session.settings} />;
}
