import { createConsumer } from "@rails/actioncable";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const wsUrl = config.public.apiUrl.replace("http", "ws") + "/cable";
  const consumer = createConsumer(wsUrl);
  nuxtApp.provide("cable", consumer);
});
