import { defineEventHandler, getHeader } from "h3";

export default defineEventHandler((event) => {
  const auth = getHeader(event, "authorization");

  if (!auth || auth.indexOf("Basic ") === -1) {
    event.node.res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    event.node.res.statusCode = 401;
    event.node.res.end("Unauthorized");
    return;
  }

  const base64Credentials = auth.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  const validUsername = process.env.BASIC_AUTH_USER;
  const validPassword = process.env.BASIC_AUTH_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    event.node.res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    event.node.res.statusCode = 401;
    event.node.res.end("Unauthorized");
    return;
  }
});
