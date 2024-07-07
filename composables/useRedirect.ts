import { useRouter } from "#app";

export const useRedirect = () => {
  const router = useRouter();

  const redirectToChatroom = async () => {
    await router.push("/chatroom");
  };

  const redirectToLogin = async () => {
    await router.push("/");
  };

  return {
    redirectToChatroom,
    redirectToLogin,
  };
};
