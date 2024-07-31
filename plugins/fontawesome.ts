import { defineNuxtPlugin } from "#app";
import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faHeart,
  faEye,
  faEyeSlash,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

export const setupFontAwesome = () => {
  config.autoAddCss = false;
  library.add(faHeart, faEye, faEyeSlash, faBars);
};

export default defineNuxtPlugin((nuxtApp) => {
  setupFontAwesome();
  nuxtApp.vueApp.component("font-awesome-icon", FontAwesomeIcon);
});
