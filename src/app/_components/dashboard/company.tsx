"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompanyDashboard() {
  const { data: projects, error } = api.project.getCompanyProjects.useQuery();
  const router = useRouter();

  const deleteProject = api.project.deleteProject.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const updateProjectStatus = api.project.updateProjectStatus.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const acceptResponse = api.response.acceptResponse.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const rejectResponse = api.response.rejectResponse.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  if (error) {
    return <div className="text-red-500">Ошибка: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
      {projects?.length == 0 ? (
        <p className="text-gray-400">Вы ещё не создали ни одного заказа.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <div key={project.id} className="bg-white/10 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Link href={`/projects/${project.id}`} className="text-blue-400 hover:underline text-xl font-semibold">
                {project.title}
              </Link>
              <div className="mt-4">
                <p className="text-gray-300">Статус: 
                  <span className={`ml-2 px-2 py推: "rounded-full text-sm ${
                    project.status == "open" ? "bg-green-500" :
                    project.status == "in_progress" ? "bg-yellow-500" :
                    project.status == "completed" ? "bg-blue-500" :
                    "bg-red-500"
                  }`}>
                    {project.status == "open" ? "Открыт" :
                     project.status == "in_progress" ? "В процессе" :
                     project.status == "completed" ? "Завершён" :
                     "Отменён"}
                  </span>
                </p>
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus.mutate({ projectId: project.id, status: e.target.value as any })}
                  className="mt-2 p-2 bg-white/10 rounded text-white border border-white/20 w-full"
                  disabled={project.status == "in_progress" && project.responses.some((r) => r.status == "accepted")}
                >
                  <option value="open">Открыт</option>
                  <option value="in_progress">В процессе</option>
                  <option value="completed">Завершён</option>
                  <option value="canceled">Отменён</option>
                </select>
                <button
                  onClick={() => deleteProject.mutate({ projectId: project.id })}
                  className="mt-2 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 w-full"
                  disabled={deleteProject.isPending}
                >
                  {deleteProject.isPending ? "Удаление..." : "Удалить"}
                </button>
              </div>
              <p className="mt-4 text-gray-300">Откликов: {project.responses.length}</p>
              {project.responses.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-300 font-semibold">Откликнувшиеся:</p>
                  <ul className="space-y-4 mt-2">
                    {project.responses.map((response) => (
                      <li key={response.id} className="bg-white/5 p-4 rounded">
                        <Link href={`/profile/${response.student.id}`} className="text-blue-400 hover:underline">
                          {response.student.name}
                        </Link>
                        <p className="text-gray-300">Статус: 
                          <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                            response.status == "pending" ? "bg-yellow-500" :
                            response.status == "accepted" ? "bg-green-500" :
                            "bg-red-500"
                          }`}>
                            {response.status == "pending" ? "Ожидает" :
                             response.status == "accepted" ? "Принят" :
                             "Отклонён"}
                          </span>
                        </p>
                        {response.materials?.length > 0 && response.status == "submitted" && (
                          <div className="mt-2">
                            <p className="text-gray-300 font-semibold">Материалы:</p>
                            <ul className="list-disc pl-5">
                              {response.materials.map((material, index) => (
                                <li key={index}>
                                  <a href={material} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    {material.split("/").pop()}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {response.status == "pending" && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => acceptResponse.mutate({ responseId: response.id })}
                              className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                              disabled={acceptResponse.isPending || project.responses.some((r) => r.status == "accepted")}
                            >
                              {acceptResponse.isPending ? "Обработка..." : "Принять"}
                            </button>
                            <button
                              onClick={() => rejectResponse.mutate({ responseId: response.id })}
                              className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                              disabled={rejectResponse.isPending}
                            >
                              {rejectResponse.isPending ? "Обработка..." : "Отклонить"}
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}