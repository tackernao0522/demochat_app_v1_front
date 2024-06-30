import { createConsumer } from "@rails/actioncable";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const consumer = createConsumer(
    process.env.NODE_ENV === "production"
      ? "wss://demochat-api.fly.dev/cable"
      : "ws://localhost:3000/cable"
  );
  nuxtApp.provide("cable", consumer);
});
