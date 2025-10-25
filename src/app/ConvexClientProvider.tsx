"use client";
import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize the Convex client using your public URL
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

/**
 * Wrap your application or page in this provider to enable Convex React hooks.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}