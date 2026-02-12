"use client";

import React, { useCallback, useEffect, useRef } from "react";
import * as jose from "jose";

const Refresher = ({ children }: { children: React.ReactNode }) => {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRefreshRef = useRef<() => void>(() => {});

  const getAccessToken = async () => {
    const res = await fetch("/api/auth/accessToken");
    if (!res.ok) return;
    const data = await res.json();
    return data.token;
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });

      if (!res.ok) {
        console.log("Failed to refresh access token");
        return;
      }

      console.log("Access token refreshed");
    } catch (err) {
      console.error("Error while refreshing token", err);
    }

    // ✅ call latest startRefresh safely
    startRefreshRef.current();
  }, []);

  const startRefresh = useCallback(async () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    const accessToken = await getAccessToken();
    if (!accessToken) return;

    const { exp } = jose.decodeJwt(accessToken);
    if (!exp) return;

    const refreshTime = exp * 1000 - Date.now() - 5000;

    timeoutId.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);
  }, [refreshAccessToken]);

  // keep ref updated
  useEffect(() => {
    startRefreshRef.current = startRefresh;
  }, [startRefresh]);

  useEffect(() => {
    startRefresh();

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [startRefresh]);

  return <>{children}</>;
};

export default Refresher;
