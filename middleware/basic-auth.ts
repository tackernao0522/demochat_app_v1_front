import { defineNuxtRouteMiddleware, useRuntimeConfig } from "nuxt/app";

export default defineNuxtRouteMiddleware((to, from, next) => {
  console.log("Middleware triggered");

  if (process.env.NODE_ENV !== "production" || !process.server) {
    console.log(
      "Skipping basic auth in non-production environment or client-side"
    );
    return next();
  }

  const runtimeConfig = useRuntimeConfig();
  const user = runtimeConfig.basicAuthUser;
  const pass = runtimeConfig.basicAuthPassword;

  if (!user || !pass) {
    console.log("Skipping basic auth due to missing credentials");
    return next();
  }

  console.log("Basic Auth User:", user);
  console.log("Basic Auth Password:", pass);

  const auth = { login: user, password: pass };

  const b64auth = (to.req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");

  console.log("Login:", login);
  console.log("Password:", password);

  if (login && password && login === auth.login && password === auth.password) {
    console.log("Authentication successful");
    return next();
  }

  console.log("Authentication failed");

  to.res.statusCode = 401;
  to.res.setHeader("WWW-Authenticate", 'Basic realm="401"');
  to.res.end("Unauthorized");
});
