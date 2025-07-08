"use client";

import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { UploadButton } from "~/utils/uploadthing";

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, error } = api.getProjectById.useQuery(
    { id: projectId },
  );

  const responseToProject = api.responseToProject.useMutation({
    onSuccess: () => {router.refresh();},
  });
  
  const { data: acceptedResponse } = api.getAcceptedResponseForProject.useQuery({ projectId });
  const { data: response } = api.getStudentResponseForProject.useQuery({ projectId },
    { enabled: session?.user.role == "student" }
  );

  const submitWork = api.submitWork.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      console.log(`Ошибка: ${error.message}`);
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([""]);
  const isAssignedStudent = session?.user.id == acceptedResponse?.studentId && project?.status == "in_progress";

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
        <p className="text-gray-300 mb-2">Категория: {project.category || "Не указана"}</p>
        <p className="text-gray-300 mb-2">Бюджет: {project.budget ? `${project.budget} ₽` : "Не указан"}</p>
        <p className="text-gray-300 mb-2">Дедлайн: {project.deadline ? project.deadline.toLocaleDateString() : "Не указан"}</p>
        <p className="text-gray-300 mb-4">Описание: {project.description}</p>
        <p className="text-gray-300 mb-4">
          Заказчик:
          <div>
            <img src={project.company?.image} alt={`Фото профиля ${project.company?.name}`} className="w-10 h-10 rounded-full mx-auto" />
            {project.company?.name}
          </div>
        </p>

        {session?.user.role == "student" && project.status == "open" && !response && (
          <button
            onClick={() => responseToProject.mutate({ projectId })}
            className="mt-4 bg-[hsl(280,100%,70%)] text-white rounded px-4 py-2 hover:bg-[hsl(280,100%,60%)] disabled:opacity-50"
            disabled={responseToProject.isPending}
          >
            {responseToProject.isPending ? "Отправка..." : "Подать заявку"}
          </button>
        )}
        {session?.user.role == "student" && response && (
          <p className="text-gray-300 mt-4">Вы уже откликнулись на этот заказ. Статус: {response.status}</p>
        )}

        {isAssignedStudent && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Сдать проект</h2>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  const newFiles = res.map((file) => file.url);
                  setUploadedFiles((prev) => [...prev, ...newFiles]);
                }
              }}
              content={{
                button({ isUploading }) {
                  return isUploading ? "Загрузка..." : "Загрузить материалы";
                },
              }}
            />
            {links.map((link, index) => (
              <div key={index} className="flex items-center mt-2">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = e.target.value;
                    setLinks(newLinks);
                  }}
                  className="p-2 bg-white/10 rounded text-white w-full"
                  placeholder="Введите ссылку"
                />
                <button
                  onClick={() => setLinks(links.filter((_, i) => i != index))}
                  className="ml-2 text-red-400"
                >
                  Удалить
                </button>
              </div>
            ))}
            <button
              onClick={() => setLinks([...links, ""])}
              className="mt-2 text-blue-400"
            >
              Добавить ссылку
            </button>
            <button
              onClick={() => submitWork.mutate({
                responseId: acceptedResponse!.id,
                materials: [...uploadedFiles, ...links.filter((link) => link.trim() != "")],
              })}
              className="mt-4 bg-green-500 text-white rounded px-4 py-2"
              disabled={submitWork.isPending}
            >
              {submitWork.isPending ? "Отправка..." : "Сдать проект"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}