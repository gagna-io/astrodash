"use client";

import dynamic from "next/dynamic";

// Client-only: the dashboard reads localStorage and the current time on first render.
const Dashboard = dynamic(() => import("@/components/Dashboard"), { ssr: false });

export default function DashboardPage() {
  return <Dashboard />;
}
