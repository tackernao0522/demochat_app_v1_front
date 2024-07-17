import {
  defineNuxtRouteMiddleware,
  useRuntimeConfig,
  useRequestHeaders,
} from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server && process.env.NODE_ENV === "production") {
    const config = useRuntimeConfig();

    // TypeScript型チェックを追加
    const headers = useRequestHeaders() as { authorization?: string };

    if (!headers.authorization) {
      return {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      };
    }

    const [, base64Credentials] = headers.authorization.split(" ");
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const [username, password] = credentials.split(":");

    if (!config.BASIC_AUTH_USERNAME || !config.BASIC_AUTH_PASSWORD) {
      console.error("Basic auth credentials not set in environment");
      return {
        status: 500,
        statusMessage: "Server configuration error",
      };
    }

    if (
      username !== config.BASIC_AUTH_USERNAME ||
      password !== config.BASIC_AUTH_PASSWORD
    ) {
      return {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      };
    }
  }
});
