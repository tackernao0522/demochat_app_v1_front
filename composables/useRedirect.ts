import { useRouter } from "#app";

export const useRedirect = () => {
  const router = useRouter();

  const redirectToChatroom = () => {
    router.push("/chatroom");
  };

  const redirectToLogin = () => {
    router.push("/");
  };

  return {
    redirectToChatroom,
    redirectToLogin,
  };
};
