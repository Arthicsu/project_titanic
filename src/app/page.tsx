import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import ProjectsPage from "./_components/projects/list/listProjects";
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Stud <span className="text-[hsl(280,100%,70%)]">freelance</span>
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {/* потом уберу (наверно)*/}
                {session && <span>Вы вошли в систему как {session.user?.name}</span>}
              </p>
              <div className="flex gap-4">                
                <Link href={session ? "/api/auth/signout" : "/api/auth/signin"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
                  {session ? "Выйти из аккаунта" : "Войти в аккаунт"}
                </Link>
                {session && <Link href={"/profile"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">Профиль</Link>}
                {session && <Link href={"/projects/create"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">Создать заказ</Link>}
              </div>
            </div>
          </div>
        </div>
           <ProjectsPage />
      </main>
    </HydrateClient>
  );
}
