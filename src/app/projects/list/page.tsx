"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: session} = useSession();

  const { data: projects, error } = api.getProjects.useQuery(undefined, {enabled: true});

  if (error) {
    return (
      <div className="">
        Ошибка: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <h1 className="text-3xl font-bold mb-6">Проекты</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <div key={project.id} className="bg-white/10 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="text-gray-300">Категория: {project.category || "Не указана"}</p>
            <p className="text-gray-300">Бюджет: {project.budget ?? "Не указан"} ₽</p>
            <p className="text-gray-300">
              Дедлайн: {project.deadline?.toLocaleDateString() ?? "Не указан"}
            </p>
            <p className="text-gray-300">
              Статус: {project.status == "open" ? "Открыт" : project.status == "in_progress" ? "В процессе" : project.status == "completed" ? "Завершён" : "Отменён"}
            </p>
            <p className="text-gray-300">Заказчик: {project.company?.name}</p>
            <Link href={`/projects/${project.id}`} className="text-blue-400 hover:underline mt-2 block">Подробнее</Link>
            {session?.user?.role == "student" && project.status == "open" && (
              <Link href={`/projects/${project.id}`} className="mt-2 inline-block bg-[hsl(280,100%,70%)] text-white rounded px-4 py-2 hover:bg-[hsl(280,100%,60%)]">
                Откликнуться
              </Link>)}
            {session?.user?.role == "company" && project.companyId == session.user.id && (
              <Link href={`/projects/${project.id}/responses`} className="mt-2 inline-block text-blue-400 hover:underline">
                Просмотреть отклики
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}