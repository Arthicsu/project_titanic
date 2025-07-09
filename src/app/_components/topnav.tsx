"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function TopNav() {
  const { data: session} = useSession();
  return (
      <nav className="w-full bg-gradient-to-b from-[#2e026d] to-[#2e026d] text-white">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href={"/"} className="font-semibold no-underline transition">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[2rem]">
              Stud <span className="text-[hsl(280,100%,70%)]">freelance</span>
            </h1>
          </Link>
          <div className="flex gap-4">
            <Link href={session ? "/profile" : "/api/auth/signin"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
              {session ? "Профиль" : "Войти в аккаунт"}
            </Link>
            <Link href={"/projects/list"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">Задания</Link>
            <Link href={"/dashboard"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">Личный кабинет</Link>
            <Link href={"#"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">Вакансии</Link>
            {session?.user?.role == "company" && <Link href={"/projects/create"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">Дать задания</Link>}
          </div>
        </div>
      </nav>
  );
}