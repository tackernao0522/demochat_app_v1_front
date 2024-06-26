export const useLocalStorage = () => {
  const saveAuthData = (headers: any, data: any) => {
    window.localStorage.setItem("access-token", headers["access-token"]);
    window.localStorage.setItem("client", headers.client);
    window.localStorage.setItem("uid", headers.uid);
    window.localStorage.setItem("name", data.name);
  };

  const getAuthData = () => {
    return {
      token: window.localStorage.getItem("access-token"),
      client: window.localStorage.getItem("client"),
      uid: window.localStorage.getItem("uid"),
    };
  };

  return { saveAuthData, getAuthData };
};
