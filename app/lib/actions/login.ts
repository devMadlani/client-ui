"use server";
import cookie from "cookie";

import { NextResponse } from "next/server";

export default async function login(prevState: unknown, formdata: FormData) {
  const email = formdata.get("email") as string;
  const password = formdata.get("password") as string;
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

    const setCookiesHeader = response.headers.get("set-cookie");
    if (!setCookiesHeader) {
      return { type: "error", message: "No cookies received from backend" };
    }

    // Parse cookies
    const parsedCookies = cookie.parse(setCookiesHeader);
    const accessToken = parsedCookies.accessToken;
    const refreshToken = parsedCookies.refreshToken;

    if (!accessToken || !refreshToken) {
      return { type: "error", message: "Tokens not found in cookies" };
    }

    const res = NextResponse.json({
      type: "success",
      message: "Login successful!",
    });

    res.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

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
