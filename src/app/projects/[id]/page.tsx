"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const projectId = params.id;

  const { data: project, error } = api.getProjectById.useQuery(
    { id: projectId },
  );

  const responseToProject = api.responseToProject.useMutation({
    onSuccess: () => {router.refresh()},
  });

  if (!project) {
    return (
      <div className="container mx-auto p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        Ошибка: {error?.message || "Заказ не найден :("}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
      <div className="bg-white/10 p-6 rounded-lg shadow-md">
        <p className="text-gray-300 mb-2">
          <p>Категория: {project.category || "Не указана"}</p> 
        </p>
        <p className="text-gray-300 mb-2">
          <p>Бюджет: {project.budget ? `${project.budget} ₽` : "Не указан"}</p> 
        </p>
        <p className="text-gray-300 mb-2">
          <p>Дедлайн: {project.deadline ? project.deadline.toLocaleDateString() : "Не указан"}</p>
        </p>
        <p className="text-gray-300 mb-4">
          <p>Описание:</p> {project.description}
        </p>
        <p className="text-gray-300 mb-4">
          <p>Заказчик:</p>
          <div>
            <img src={project.company?.image} alt={`Фото профиля ${project.company?.name}`} className="w-10 h-10 rounded-full mx-auto"/>
            {project.company?.name}
          </div> 
        </p>

        {session?.user.role === "student" && (
          <button className="mt-4 bg-[hsl(280,100%,70%)] text-white rounded px-4 py-2 hover:bg-[hsl(280,100%,60%)] disabled:opacity-50" disabled={responseToProject.isPending}>
            Подать заявку
          </button>
        )}
      </div>
    </div>
  );
}