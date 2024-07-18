import { defineNuxtRouteMiddleware, useRuntimeConfig } from "#app";
import { useNuxtApp } from "#imports";

export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig();
  const { ssrContext } = useNuxtApp();

  console.log("Global Basic Auth middleware is running");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Basic Auth User:", config.basicAuthUser);
  console.log("Basic Auth Password:", config.basicAuthPassword);

  if (process.server && process.env.NODE_ENV === "production") {
    if (!ssrContext || !ssrContext.event) {
      console.log("No request event found");
      return;
    }

    const auth = ssrContext.event.node.req.headers.authorization;

    if (!auth) {
      console.log("No authorization header found");
      ssrContext.event.node.res.setHeader(
        "WWW-Authenticate",
        'Basic realm="Secure Area"'
      );
      ssrContext.event.node.res.statusCode = 401;
      ssrContext.event.node.res.end("Unauthorized");
      return;
    }

    const [, base64Credentials] = auth.split(" ");
    const [username, password] = Buffer.from(base64Credentials, "base64")
      .toString()
      .split(":");

    if (
      username !== config.basicAuthUser ||
      password !== config.basicAuthPassword
    ) {
      console.log("Invalid credentials provided");
      ssrContext.event.node.res.setHeader(
        "WWW-Authenticate",
        'Basic realm="Secure Area"'
      );
      ssrContext.event.node.res.statusCode = 401;
      ssrContext.event.node.res.end("Unauthorized");
      return;
    }

    console.log("Basic Auth successful");
  } else {
    console.log("Skipping Basic Auth: Not in production or not server-side");
  }
});
