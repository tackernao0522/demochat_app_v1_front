import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faHeart,
  faEye,
  faEyeSlash,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

config.autoAddCss = false;

library.add(faHeart, faEye, faEyeSlash, faBars);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("font-awesome-icon", FontAwesomeIcon);
});
