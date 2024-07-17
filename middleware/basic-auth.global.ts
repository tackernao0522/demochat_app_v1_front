export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server && process.env.NODE_ENV === "production") {
    const config = useRuntimeConfig();
    const auth = useRequestHeaders(["authorization"]);

    if (!auth.authorization) {
      return sendRedirect(to.path, {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }

    const [, base64Credentials] = auth.authorization.split(" ");
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(":");

    if (
      username !== config.BASIC_AUTH_USERNAME ||
      password !== config.BASIC_AUTH_PASSWORD
    ) {
      return sendRedirect(to.path, {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }
  }
});
