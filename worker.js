// Geo split on the home page.
// Brazil -> Portuguese sales page (pt.html). Everyone else -> original VSL (index.html).
// Test override: ?geo=BR or ?geo=US. Diagnostic: /__geo (203 = pt, 200 = vsl)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cfCountry = (request.cf && request.cf.country) || "XX";

    if (url.pathname === "/__geo") {
      return new Response(cfCountry + " -> " + (cfCountry === "BR" ? "pt" : "vsl") + "\n", {
        status: cfCountry === "BR" ? 203 : 200,
        headers: { "Cache-Control": "no-store", "x-geo-country": cfCountry },
      });
    }

    const isHome = url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/index";
    if (!isHome) return env.ASSETS.fetch(request);

    const country = (url.searchParams.get("geo") || "").toUpperCase() || cfCountry;
    const variant = country === "BR" ? "pt" : "vsl";
    const res = await env.ASSETS.fetch(new Request(new URL(variant === "pt" ? "/pt" : "/", url.origin), request));
    const out = new Response(res.body, res);
    out.headers.set("Cache-Control", "private, no-store");
    out.headers.set("Vary", "*");
    out.headers.set("x-geo-country", country);
    out.headers.set("x-geo-variant", variant);
    return out;
  },
};
