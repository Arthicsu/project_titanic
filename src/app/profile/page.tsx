import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { ProfileForm } from "../_components/user/profileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }
  const user = await api.getUserProfile();

  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <ProfileForm initialData={user} />
    </div>
  );
}