"use client";

import { useSession } from "next-auth/react";
import StudentDashboard from "../_components/dashboard/student";
import CompanyDashboard from "../_components/dashboard/company";

export default function DashboardPage() {
  const { data: session} = useSession();

  if (!session) {
    return;
  }

  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      {session.user.role == "student" ? <StudentDashboard /> : <CompanyDashboard />}
    </div>
  );
}