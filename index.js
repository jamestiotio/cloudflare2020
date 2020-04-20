// Cloudflare Internship 2020 Full-Stack Workers Application
// Created by James Raphael Tiovalen (2020)
// Site deployed at: https://cloudflare2020.jamestiotio.workers.dev

// Define fetch event listener
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

// Use HTMLRewriter to customize variant pages
class VariantHandler {
  element(element) {
    if (element.tagName == "title") {
      element.setInnerContent(
        "Cloudflare Internship 2020 Full-Stack Application"
      );
    } else if (
      element.tagName == "h1" &&
      element.getAttribute("id") == "title"
    ) {
      element.setInnerContent("James Raphael Tiovalen");
    } else if (
      element.tagName == "p" &&
      element.getAttribute("id") == "description"
    ) {
      element.setInnerContent(
        "Welcome to James's project for the Cloudflare full-stack application!"
      );
    } else if (element.tagName == "a" && element.getAttribute("id") == "url") {
      element.setAttribute("href", "https://jamestiotio.github.io");
      element.setInnerContent("Come visit James's personal website!");
    }
  }
}

/**
 * Main request handler function
 * Respond with a custom variant page
 * @param {Request} request
 */
async function handleRequest(request) {
  const data = await fetch(
    "https://cfw-takehome.developers.workers.dev/api/variants"
  )
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      return new Response(error);
    });

  const cookie = request.headers.get("Cookie");
  let variant;

  if (cookie && cookie.includes("variant-cookie=0")) {
    variant = 0;
  } else if (cookie && cookie.includes("variant-cookie=1")) {
    variant = 1;
  } else {
    variant = Math.floor(Math.random() * data.variants.length);
  }

  const choice = data.variants[variant];

  const res = await fetch(choice)
    .then((response) => {
      return new HTMLRewriter()
        .on("*", new VariantHandler())
        .transform(response);
    })
    .catch((error) => {
      return new Response(error);
    });

  res.headers.append("Set-Cookie", `variant-cookie=${variant}`);

  return res;
}
