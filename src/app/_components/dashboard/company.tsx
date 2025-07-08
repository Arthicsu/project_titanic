"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

export default function CompanyDashboard() {
  const { data: projects, error } = api.getCompanyProjects.useQuery();
  const router = useRouter();

  const deleteProject = api.deleteProject.useMutation({
    onSuccess: () => {
      toast.success("Заказ удалён");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const updateProjectStatus = api.updateProjectStatus.useMutation({
    onSuccess: () => {
      toast.success("Статус обновлён");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const acceptResponse = api.acceptResponse.useMutation({
    onSuccess: () => {
      toast.success("Отклик принят");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const rejectResponse = api.rejectResponse.useMutation({
    onSuccess: () => {
      toast.success("Отклик отклонён");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  if (error) {
    return <div>Ошибка: {error.message}</div>;
  }

  return (
    <div>
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Мои заказы</h1>
      {projects?.length === 0 ? (
        <p>Вы ещё не создали ни одного заказа.</p>
      ) : (
        <ul className="space-y-4">
          {projects?.map((project) => (
            <li key={project.id} className="bg-white/10 p-4 rounded">
              <Link href={`/projects/${project.id}`} className="text-blue-400 hover:underline">
                {project.title}
              </Link>
              <div className="mt-2">
                <p>Статус: {project.status}</p>
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus.mutate({ projectId: project.id, status: e.target.value as any })}
                  className="mt-2 p-2 bg-white/10 rounded text-white border border-white/20"
                >
                  <option value="open">Открыт</option>
                  <option value="in_progress">В процессе</option>
                  <option value="completed">Завершён</option>
                  <option value="canceled">Отменён</option>
                </select>
                <button
                  onClick={() => deleteProject.mutate({ projectId: project.id })}
                  className="mt-2 ml-2 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                  disabled={deleteProject.isPending}
                >
                  {deleteProject.isPending ? "Удаление..." : "Удалить"}
                </button>
              </div>
              <p>Откликов: {project.responses.length}</p>
              {project.responses.length > 0 && (
                <div className="mt-2">
                  <p>Откликнувшиеся студенты:</p>
                  <ul className="list-disc pl-5">
                    {project.responses.map((response) => (
                      <li key={response.id}>
                        {response.student.name} - {response.status}
                        {response.materials?.length > 0 && (
                          <div className="mt-1">
                            <p>Материалы:</p>
                            <ul className="list-circle pl-5">
                              {response.materials.map((material, index) => (
                                <li key={index}>
                                  <a href={material} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    {material}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {response.status === "pending" && (
                          <div className="mt-2">
                            <button
                              onClick={() => acceptResponse.mutate({ responseId: response.id })}
                              className="mr-2 bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                              disabled={acceptResponse.isPending}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}