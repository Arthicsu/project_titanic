import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import ProjectsPage from "./projects/list/page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-3xl text-white">
                {/* потом уберу (наверно)*/}
                {session && <span>Здравствуйте, {session.user?.name}</span>}
              </p>
            </div>
          </div>
            <div className="how-block">
              <div className="how-title rounded-full bg-white/30 px-10 py-3 font-semibold no-underline transition">Как пользоваться Stud <span className="text-[hsl(280,100%,70%)]">freelance</span>?</div>
              <div className="how-steps">
                <div className="how-step">
                <div className="how-num bg-gradient-to-b from-[#2e026d] to-[#15162c]">1</div>
                <div className="how-desc rounded-full bg-white/30 px-10 py-3 font-semibold no-underline transition">Создайте задание</div>
              </div>
                <div className="how-step">
                  <div className="how-num bg-gradient-to-b from-[#2e026d] to-[#15162c]">2</div>
                <div className="how-desc rounded-full bg-white/30 px-10 py-3 font-semibold no-underline transition">Находим исполнителя</div>
              </div>
                <div className="how-step">
              <div className="how-num bg-gradient-to-b from-[#2e026d] to-[#15162c]">3</div>
              <div className="how-desc rounded-full bg-white/30 px-10 py-3 font-semibold no-underline transition">Оплата после просмотра</div>
            </div>
            </div>
           </div>
        </div>
      </main>
    </HydrateClient>
  );
}
