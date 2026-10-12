import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    const serverFn = new URL(request.url).pathname.includes("/_serverFn/");
    if (serverFn || (error != null && typeof error === "object" && "statusCode" in error)) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests. Same-site previews and a matching Origin are
// accepted so a save from the desk page is not rejected as a foreign site.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  secFetchSite: (site, ctx) => {
    if (site === "same-origin" || site === "same-site" || site === "none") return true;
    const origin = ctx.request.headers.get("origin");
    if (!origin) return false;
    try {
      return new URL(origin).host === new URL(ctx.request.url).host;
    } catch {
      return false;
    }
  },
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
