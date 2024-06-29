import { createConsumer } from "@rails/actioncable";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const wsProtocol = process.env.NODE_ENV === "production" ? "wss" : "ws";
  const wsUrl = config.public.apiUrl.replace(/^http/, wsProtocol) + "/cable";
  const consumer = createConsumer(wsUrl);
  nuxtApp.provide("cable", consumer);
});
