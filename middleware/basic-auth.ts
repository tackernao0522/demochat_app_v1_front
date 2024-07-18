import { defineNuxtRouteMiddleware, useRuntimeConfig } from "#app";
import { H3Event } from "h3";

export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp();
  const event: H3Event = nuxtApp.ssrContext?.event;

  if (process.server && event) {
    const config = useRuntimeConfig();

    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Basic Auth User:", config.basicAuthUser);
    console.log("Basic Auth Password:", config.basicAuthPassword);

    // 本番環境でのみBasic認証を適用
    if (process.env.NODE_ENV !== "production") {
      console.log("Skipping Basic Auth: Not in production");
      return;
    }

    const auth = event.node.req.headers.authorization;

    if (!auth || auth.indexOf("Basic ") === -1) {
      console.log("No valid authorization header found");
      return sendUnauthorized(event);
    }

    const base64Credentials = auth.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");

    const validUsername = config.basicAuthUser;
    const validPassword = config.basicAuthPassword;

    if (username !== validUsername || password !== validPassword) {
      console.log("Invalid credentials provided");
      return sendUnauthorized(event);
    }

    console.log("Basic Auth successful");
  }
});

function sendUnauthorized(event: H3Event) {
  event.node.res.setHeader("WWW-Authenticate", 'Basic realm="Secure Area"');
  event.node.res.statusCode = 401;
  return event.node.res.end("Unauthorized");
}
