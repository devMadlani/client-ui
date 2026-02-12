"use server";
import { cookies } from "next/headers";

export default async function register(_: unknown, formdata: FormData) {
  const firstName = formdata.get("firstName");
  const lastName = formdata.get("lastName");
  const email = formdata.get("email");
  const password = formdata.get("password");
  // todo: do request data validation

  // call auth service

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
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
      message: "Registration successful!",
    };
  } catch (err: unknown) {
    return {
      type: "error",
      message: (err as Error).message,
    };
  }
}
