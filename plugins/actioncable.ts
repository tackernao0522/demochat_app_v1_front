import { createConsumer } from "@rails/actioncable";

export default defineNuxtPlugin((nuxtApp) => {
  const consumer = createConsumer("ws://localhost:3000/cable");
  nuxtApp.provide("cable", consumer);
});
