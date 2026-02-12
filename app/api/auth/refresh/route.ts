import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/auth/auth/refresh`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookieStore.get("accessToken")?.value}`,
        Cookie: `refreshToken=${cookieStore.get("refreshToken")?.value}`,
      },
    },
  );

  if (!response.ok) {
    console.log("Refresh failed.");
    return Response.json({ success: false });
  }

  const c = response.headers.getSetCookie();
  const accessToken = c.find((cookie) => cookie.includes("accessToken"));
  const refreshToken = c.find((cookie) => cookie.includes("refreshToken"));

  if (!accessToken || !refreshToken) {
    console.log("Tokens could not found.");
    return Response.json({ success: false });
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

  return Response.json({ success: true });
}
