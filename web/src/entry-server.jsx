import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import routes from "./routes.jsx";

const { query, dataRoutes } = createStaticHandler(routes);

/**
 * Renders one request to HTML. Called by server.js for every page request.
 * Returns the rendered markup, collected <head> tags, and the router
 * hydration state that the client needs to avoid re-fetching loader data.
 */
export async function render(url, headers = new Headers()) {
  const request = new Request(`http://localhost${url}`, { headers });
  const context = await query(request);

  // A loader/action returned a redirect Response - let the host handle it.
  if (context instanceof Response) {
    return { redirect: context };
  }

  const router = createStaticRouter(dataRoutes, context);
  const helmetContext = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouterProvider router={router} context={context} />
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  const head = [
    helmet.title.toString(),
    helmet.meta.toString(),
    helmet.link.toString(),
    helmet.script.toString(),
  ].join("\n");

  const hydrationData = {
    loaderData: context.loaderData,
    actionData: context.actionData,
    errors: context.errors,
  };

  return { html, head, hydrationData, statusCode: context.statusCode };
}
