import { useRouter } from "#app";

export const useRedirect = () => {
  const router = useRouter();

  const redirectToChatroom = async () => {
    console.log("Redirecting to chatroom");
    try {
      await router.push("/chatroom");
    } catch (error) {
      console.error("Error redirecting to chatroom:", error);
    }
  };

  const redirectToLogin = async () => {
    console.log("Redirecting to login");
    try {
      await router.push("/");
    } catch (error) {
      console.error("Error redirecting to login:", error);
    }
  };

  return {
    redirectToChatroom,
    redirectToLogin,
  };
};
