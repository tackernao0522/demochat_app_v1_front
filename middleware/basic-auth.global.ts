import {
  defineNuxtRouteMiddleware,
  useRuntimeConfig,
  useRequestEvent,
} from "#app";
import { createError } from "h3";

const REALM = "Secure Area";
const UNAUTHORIZED_MESSAGE = "Unauthorized";

export const basicAuthMiddleware = (event: any, config: any) => {
  console.log("Global Basic Auth middleware is running");
  console.log("NODE_ENV:", process.env.NODE_ENV);

  if (process.server && process.env.NODE_ENV === "production") {
    if (!event) {
      console.error("No request event found");
      return;
    }

    const auth = event.node.req.headers.authorization;

    if (!auth || !auth.startsWith("Basic ")) {
      setUnauthorizedResponse(event);
      return createError({
        statusCode: 401,
        statusMessage: UNAUTHORIZED_MESSAGE,
      });
    }

    const [, base64Credentials] = auth.split(" ");
    const [username, password] = Buffer.from(base64Credentials, "base64")
      .toString()
      .split(":");

    if (
      username !== config.basicAuthUser ||
      password !== config.basicAuthPassword
    ) {
      setUnauthorizedResponse(event);
      return createError({
        statusCode: 401,
        statusMessage: UNAUTHORIZED_MESSAGE,
      });
    }

    console.log("Basic Auth successful");
  }
};

function setUnauthorizedResponse(event: any) {
  event.node.res.setHeader("WWW-Authenticate", `Basic realm="${REALM}"`);
}

export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig();
  const event = useRequestEvent();
  return basicAuthMiddleware(event, config);
});
