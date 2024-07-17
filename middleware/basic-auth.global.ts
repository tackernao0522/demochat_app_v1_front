import {
  defineNuxtRouteMiddleware,
  useRuntimeConfig,
  useRequestHeaders,
} from "#app";
import { sendRedirect } from "h3";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server && process.env.NODE_ENV === "production") {
    const config = useRuntimeConfig();
    console.log("Runtime config:", config); // デバッグ用ログ

    const auth = useRequestHeaders(["authorization"]);
    console.log("Authorization header:", auth.authorization); // デバッグ用ログ

    if (!auth.authorization) {
      console.log("No authorization header found"); // デバッグ用ログ
      return sendRedirect(to.path, {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }

    const [, base64Credentials] = auth.authorization.split(" ");
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(":");
    console.log("Received credentials:", username, password); // デバッグ用ログ

    if (!config.BASIC_AUTH_USERNAME || !config.BASIC_AUTH_PASSWORD) {
      console.error("Basic auth credentials not set in environment"); // エラーログ
      return sendRedirect(to.path, {
        status: 500,
        statusMessage: "Server configuration error",
      });
    }

    if (
      username !== config.BASIC_AUTH_USERNAME ||
      password !== config.BASIC_AUTH_PASSWORD
    ) {
      console.log("Invalid credentials"); // デバッグ用ログ
      return sendRedirect(to.path, {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }

    console.log("Authentication successful"); // デバッグ用ログ
  }
});
