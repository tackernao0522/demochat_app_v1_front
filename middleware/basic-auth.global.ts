import { defineNuxtRouteMiddleware, useRuntimeConfig } from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig();

  console.log("Global Basic Auth middleware is running");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Basic Auth User:", config.basicAuthUser);
  console.log("Basic Auth Password:", config.basicAuthPassword);

  if (process.server && process.env.NODE_ENV === "production") {
    const event = useRequestEvent();
    if (!event) {
      console.log("No request event found");
      return;
    }

    const auth = event.node.req.headers.authorization;

    if (!auth) {
      console.log("No authorization header found");
      event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
      event.node.res.statusCode = 401;
      event.node.res.end("Unauthorized");
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
      event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
      event.node.res.statusCode = 401;
      event.node.res.end("Unauthorized");
      return;
    }

    console.log("Basic Auth successful");
  } else {
    console.log("Skipping Basic Auth: Not in production or not server-side");
  }
});
