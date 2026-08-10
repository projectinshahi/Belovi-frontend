"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleOAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
    // If no client ID is configured, render children without the provider
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}
