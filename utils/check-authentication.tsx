import Cookies from "js-cookie";

export const checkAuthentication = async () => {
  try {
    const userStr = Cookies.get("auth.user");
    if (!userStr) {
      return { session: "", status: false, user: "" };
    }
    const userResponse = JSON.parse(userStr);
    const { session, user }: any = userResponse;
    return {
      session: session,
      status: true,
      user: user.user_profileCollection.edges[0].node || user || null,
    };
  } catch (error) {
    return { session: "", status: false, user: "" };
  }
};
