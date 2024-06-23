import { useRouter } from "#app";

export const useRedirect = () => {
  const router = useRouter();

  const redirectToChatroom = () => {
    router.push("/Chatroom");
  };

  return {
    redirectToChatroom,
  };
};
