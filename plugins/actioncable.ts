import { createConsumer } from "@rails/actioncable";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl;
  const wsUrl =
    apiUrl.replace("http://", "ws://").replace("https://", "wss://") + "/cable";
  const consumer = createConsumer(wsUrl);
  nuxtApp.provide("cable", consumer);
});
