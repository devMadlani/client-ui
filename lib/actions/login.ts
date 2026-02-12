"use server";
import cookie from "cookie";
import { cookies } from "next/headers";

export default async function login(_: unknown, formdata: FormData) {
  const email = formdata.get("email");
  const password = formdata.get("password");
  // todo: do request data validation

  // call auth service

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.log("error", error);
      return {
        type: "error",
        message: error.errors[0].msg,
      };
    }

    const c = response.headers.getSetCookie();
    const accessToken = c.find((cookie) => cookie.includes("accessToken"));
    const refreshToken = c.find((cookie) => cookie.includes("refreshToken"));

    if (!accessToken || !refreshToken) {
      return {
        type: "error",
        message: "No cookies were found!",
      };
    }

    const parsedAccessToken = cookie.parse(accessToken);
    const parsedRefreshToken = cookie.parse(refreshToken);

    console.log(parsedAccessToken, parsedRefreshToken);
    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      const cookieStore = await cookies();

      setCookie.split(/,(?=\s*\w+=)/).forEach((cookieStr) => {
        const [nameValue] = cookieStr.split(";");
        const [name, value] = nameValue.split("=");
        cookieStore.set(name, value, {
          httpOnly: true,
          path: "/",
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });
      });
    }

    return {
      type: "success",
      message: "Login successful!",
    };
  } catch (err: unknown) {
    return {
      type: "error",
      message: (err as Error).message,
    };
  }
}
