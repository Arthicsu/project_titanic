import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { ProfileForm } from "../_components/user/profileForm";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }
  const user = await api.user.getUserProfile();

  return (
    <div className="container mx-auto p-4 text-white bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="profile-tabs flex gap-4 mb-6">
        <Link href="/profile" className="profile-tab active cursor-pointer font-semibold border-b-2 border-purple-500 text-xl">
          Профиль
        </Link>
        <Link href="/portfolio" className="profile-tab active cursor-pointer font-semibold text-xl">
          Портфолио
        </Link>
        <Link href="/api/auth/signout" className="rounded-full bg-white/10 px-2 py-1 font-semibold no-underline transition hover:bg-white/20">
          Выйти из аккаунта
        </Link>
      </div>
      <ProfileForm initialData={user} />
    </div>
  );
}