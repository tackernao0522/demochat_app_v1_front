import { useRouter } from "#app";
import { logger } from "~/utils/logger";

export const useRedirect = () => {
  const router = useRouter();

  const redirectToChatroom = async () => {
    logger.info("Redirecting to chatroom");
    try {
      await router.push("/chatroom");
    } catch (error) {
      logger.error("Error redirecting to chatroom:", error);
      window.location.href = "/chatroom";
    }
  };

  const redirectToHome = async () => {
    logger.info("Redirecting to home page");
    try {
      await router.push("/");
    } catch (error) {
      logger.error("Error redirecting to home page:", error);
      window.location.href = "/";
    }
  };

  return {
    redirectToChatroom,
    redirectToHome,
  };
};
