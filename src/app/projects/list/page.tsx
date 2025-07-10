"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: projects, error } = api.project.getProjects.useQuery(undefined, { enabled: true });

  const { data: studentResponses } = api.response.getStudentResponses.useQuery(undefined, {
    enabled: session?.user?.role == "student",
  });

  const responseToProject = api.response.responseToProject.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const responsesMap = studentResponses?.reduce(
    (acc, response) => ({
      ...acc,
      [response.projectId]: response.status,
    }),
    {} as Record<string, string>,
  ) || {};

  if (error) {
    return (
      <div className="text-red-500 text-center text-lg">
        Ошибка: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full p-6 min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-3xl font-bold mb-8">Проекты</h1>
      {projects?.length == 0 ? (
        <div className="text-gray-400 text-center">
          <p className="text-lg">Пока нет доступных проектов.</p>
          {session?.user?.role == "company" && (
            <Link
              href="/projects/create"
              className="text-blue-400 hover:underline mt-2 inline-block"
            >
              Создать проект
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-white/10 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-white/20 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-white-400 hover:underline text-lg font-semibold"
                  >
                    {project.title}
                  </Link>
                  <svg
                    className={`w-5 h-5 ml-2 ${
                      project.status == "open"
                        ? "text-green-500"
                        : project.status == "in_progress"
                        ? "text-yellow-500"
                        : project.status == "completed"
                        ? "text-blue-500"
                        : "text-red-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {project.status == "open" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : project.status == "in_progress" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : project.status == "completed" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    )}
                  </svg>
                </div>
                <p className="text-gray-400 text-sm mt-1 truncate">
                  {project.description?.substring(0, 80) || "Описание отсутствует"}
                  {project.description && project.description.length > 80 && "..."}
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <p className="text-gray-300 flex items-center">
                    {project.category ? `Категория: ${project.category}` : "Не указана"}
                  </p>
                  <p className="text-gray-300 flex items-center">
                    {project.budget ? `Бюджет: ${project.budget} ₽` : "Не указан"}
                  </p>
                  <p className="text-gray-300 flex items-center">
                    {project._count.responses ? `Откликов: ${project._count.responses}` : "Будьте первым!"}
                  </p>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-300">
                    Дедлайн:{" "}
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : "Не указан"}
                  </p>
                  <p className="text-gray-300">
                    Заказчик:{" "}
                    <Link
                      href={`/profile/${project.companyId}`}
                      className="text-blue-400 hover:underline"
                    >
                      {project.company?.name || "Не указан"}
                    </Link>
                  </p>
                  {session?.user?.role == "student" && responsesMap[project.id] && (
                    <p
                      className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                        responsesMap[project.id] == "pending"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : responsesMap[project.id] == "accepted"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      Ваш отклик:{" "}
                      {responsesMap[project.id] == "pending"
                        ? "Ожидает рассмотрения"
                        : responsesMap[project.id] == "accepted"
                        ? "Принят"
                        : "Отклонён"}
                    </p>
                  )}
                </div>
              </div>
              <div className="ml-4 flex flex-col space-y-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-center bg-white/10 text-white rounded-lg px-4 py-2 hover:bg-white/20 transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Подробнее
                </Link>
                {session?.user?.role == "student" &&
                  project.status == "open" &&
                  !responsesMap[project.id] && (
                    <button
                      onClick={() =>
                        responseToProject.mutate({ projectId: project.id })
                      }
                      className="flex items-center justify-center bg-[hsl(280,100%,70%)] text-white rounded-lg px-4 py-2 hover:bg-[hsl(280,100%,60%)] transition-colors text-sm disabled:opacity-50"
                      disabled={responseToProject.isPending}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {responseToProject.isPending ? "Отправка..." : "Откликнуться"}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}