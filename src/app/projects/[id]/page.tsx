"use client";

import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, error, refetch: refetchProject } = api.project.getProjectById.useQuery(
    { id: projectId },
    { enabled: !!projectId },
  );

  const { data: acceptedResponse, refetch: refetchAcceptedResponse } =
    api.response.getAcceptedResponseForProject.useQuery(
      { projectId },
      { enabled: !!projectId },
    );

  const { data: response, refetch: refetchResponse } =
    api.response.getStudentResponseForProject.useQuery(
      { projectId },
      { enabled: session?.user?.role == "student" && !!projectId },
    );

  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; type: string }[]>([]);
  const [links, setLinks] = useState<string[]>([""]);
  const isAssignedStudent =
    session?.user?.id == acceptedResponse?.studentId && project?.status == "in_progress";

  const responseToProject = api.response.responseToProject.useMutation({
    onSuccess: async () => {
      await Promise.all([refetchProject(), refetchResponse(), refetchAcceptedResponse()]);
      router.refresh();
    },
  });

  const submitWork = api.response.submitWork.useMutation({
    onSuccess: async () => {
      await Promise.all([refetchProject(), refetchResponse(), refetchAcceptedResponse()]);
      setUploadedFiles([]);
      setLinks([""]);
      router.refresh();
    },
    onError: (error) => {
      console.log(`Ошибка: ${error.message}`);
    },
  });

  if (!project) {
    return null;
  }

  const renderMaterials = (materials: string[]) => {
    const images = materials.filter((url) => url.match(/\.(jpeg|jpg|gif|png|svg)$/i));
    const files = materials.filter((url) => !url.match(/\.(jpeg|jpg|gif|png|svg)$/i));

    return (
      <div className="mt-4">
        {images.length > 0 && (
          <div className="relative">
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Материал ${index + 1}`}
                  className="w-32 h-32 object-cover rounded border border-white/20"
                />
              ))}
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-2">
            <p className="text-gray-300 font-medium">Файлы:</p>
            <ul className="list-disc pl-5 text-gray-300">
              {files.map((url, index) => (
                <li key={index}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {url.split("/").pop() || `Файл ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-6 min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
      <div className="bg-white/10 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-white/20">
        <div className="space-y-2">
        <div className="mt-4">
          <p className="text-gray-300 font-medium">Описание:</p>
          <p className="text-gray-300">{project.description || "Описание отсутствует"}</p>
        </div>
          <p className="text-gray-400 truncate">
            <span className="font-medium">Категория:</span> {project.category || "Не указана"}
          </p>
          <p className="text-gray-400 truncate">
            <span className="font-medium">Бюджет:</span> {project.budget ? `${project.budget} ₽` : "Не указан"}
          </p>
          <p className="text-gray-400 truncate">
            <span className="font-medium">Дедлайн:</span>{" "}
            {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Не указан"}
          </p>
          <p className="text-gray-300 flex items-center">
            Статус:{" "}
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                project.status == "open"
                  ? "bg-green-500/20 text-green-300"
                  : project.status == "in_progress"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : project.status == "completed"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {project.status == "open"
                ? "Открыт"
                : project.status == "in_progress"
                ? "В процессе"
                : project.status == "completed"
                ? "Завершён"
                : "Отменён"}
            </span>
          </p>
          <p className="text-gray-300 flex items-center">
            Заказчик:{" "}
            <Link
              href={`/profile/${project.companyId}`}
              className="text-blue-400 hover:underline"
            >
              {project.company?.name || "Не указан"}
            </Link>
          </p>
        </div>
        {session?.user?.role == "student" && project.status == "open" && !response && (
          <button
            onClick={() => responseToProject.mutate({ projectId })}
            className="mt-6 w-full flex items-center justify-center bg-[hsl(280,100%,70%)] text-white rounded-lg px-4 py-2 hover:bg-[hsl(280,100%,60%)] disabled:opacity-50"
            disabled={responseToProject.isPending}
          >
            <svg
              className="w-5 h-5 mr-2"
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
            {responseToProject.isPending ? "Отправка..." : "Подать заявку"}
          </button>
        )}
        {session?.user?.role == "student" && response && (
          <p className="mt-6 text-gray-300 flex items-center">
            <svg
              className={`w-5 h-5 mr-2 ${
                response.status == "pending"
                  ? "text-yellow-500"
                  : response.status == "accepted"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {response.status == "pending" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : response.status == "accepted" ? (
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
            Ваш отклик:{" "}
            <span
              className={`px-2 py-1 rounded-full text-sm ml-2 ${
                response.status == "pending"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : response.status == "accepted"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {response.status == "pending"
                ? "Ожидает рассмотрения"
                : response.status == "accepted"
                ? "Принят"
                : "Отклонён"}
            </span>
          </p>
        )}
        {isAssignedStudent && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Сдать проект</h2>
            <button
              onClick={() => setLinks([...links, ""])}
              className="mt-2 text-blue-400 hover:underline"
            >
              Добавить ссылку
            </button>
            <button
              onClick={() =>
                submitWork.mutate({
                  responseId: acceptedResponse!.id,
                  materials: [
                    ...uploadedFiles.map((file) => file.url),
                    ...links.filter((link) => link.trim() !== ""),
                  ],
                })
              }
              className="mt-4 w-full flex items-center justify-center bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 disabled:opacity-50"
              disabled={submitWork.isPending}
            >
              <svg
                className="w-5 h-5 mr-2"
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
              {submitWork.isPending ? "Отправка..." : "Сдать проект"}
            </button>
          </div>
        )}
        {acceptedResponse && acceptedResponse.materials.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Сданные материалы</h2>
            {renderMaterials(acceptedResponse.materials)}
          </div>
        )}
      </div>
    </div>
  );
}