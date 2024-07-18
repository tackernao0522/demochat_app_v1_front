import { defineNuxtRouteMiddleware, useRuntimeConfig } from "#app";
import { H3Event } from "h3";

export default defineNuxtRouteMiddleware((to, from) => {
  console.log("Basic Auth middleware is running");

  const nuxtApp = useNuxtApp();
  const event: H3Event | undefined = nuxtApp.ssrContext?.event;
  const config = useRuntimeConfig();

  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Is Server:", process.server);
  console.log("Basic Auth User:", config.basicAuthUser);
  console.log("Basic Auth Password:", config.basicAuthPassword);

  if (process.server && event) {
    console.log("Server-side execution confirmed");

    if (process.env.NODE_ENV !== "production") {
      console.log("Skipping Basic Auth: Not in production environment");
      return;
    }

    const auth = event.node.req.headers.authorization;

    if (!auth || auth.indexOf("Basic ") === -1) {
      console.log("No valid authorization header found");
      event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
      event.node.res.statusCode = 401;
      event.node.res.end("Unauthorized");
      return;
    }

    const base64Credentials = auth.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");

    if (
      username !== config.basicAuthUser ||
      password !== config.basicAuthPassword
    ) {
      console.log("Invalid credentials provided");
      event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
      event.node.res.statusCode = 401;
      event.node.res.end("Unauthorized");
      return;
    }

    console.log("Basic Auth successful");
  } else {
    console.log("Not running on server or no event object");
  }
});
