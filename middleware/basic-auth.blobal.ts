import { defineNuxtRouteMiddleware, useRuntimeConfig } from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig();

  console.log("Global Basic Auth middleware is running");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Basic Auth User:", config.basicAuthUser);
  console.log("Basic Auth Password:", config.basicAuthPassword);

  if (process.server && process.env.NODE_ENV === "production") {
    const event = useRequestEvent();
    const auth = event.node.req.headers.authorization;

    if (!auth || auth.indexOf("Basic ") === -1) {
      event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const [, base64Credentials] = auth.split(" ");
    const [username, password] = atob(base64Credentials).split(":");

    if (
      username !== config.basicAuthUser ||
      password !== config.basicAuthPassword
    ) {
      event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    console.log("Basic Auth successful");
  }
});
