"use client";

import { useSession } from "next-auth/react";
import StudentDashboard from "../_components/dashboard/student";
import CompanyDashboard from "../_components/dashboard/company";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Загрузка...</div>;
  }

  if (!session) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      {session.user.role === "student" ? <StudentDashboard /> : <CompanyDashboard />}
    </div>
  );
}