export default defineNuxtRouteMiddleware((to, from, next) => {
  if (process.env.NODE_ENV !== "production" || !process.server) {
    return next();
  }

  const runtimeConfig = useRuntimeConfig();
  const user = runtimeConfig.basicAuthUser;
  const pass = runtimeConfig.basicAuthPassword;

  const auth = { login: user, password: pass };

  const b64auth = (to.req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");

  if (login && password && login === auth.login && password === auth.password) {
    return next();
  }

  to.res.statusCode = 401;
  to.res.setHeader("WWW-Authenticate", 'Basic realm="401"');
  to.res.end("Unauthorized");
});
