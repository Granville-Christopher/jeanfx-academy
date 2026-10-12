import { createFileRoute } from "@tanstack/react-router";

import { PublicHome } from "@/components/desk/public-home";
import { getPublicSettings } from "@/lib/desk.functions";

export const Route = createFileRoute("/")({
  loader: () => getPublicSettings(),
  head: ({ loaderData }) => {
    const name = loaderData?.traderName ?? "Private desk";
    const description = loaderData?.subheadline ?? "Private trading mentorship.";
    return {
      meta: [
        { title: `${name} | Private Trading Mentorship` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} | Private Trading Mentorship` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const settings = Route.useLoaderData();
  return <PublicHome settings={settings} />;
}
