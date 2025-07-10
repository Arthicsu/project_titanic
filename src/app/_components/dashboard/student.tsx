"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: responses, error } = api.response.getStudentResponses.useQuery();

  const withdrawResponse = api.response.withdrawResponse.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  if (error) {
    return <div className="text-red-500 text-center text-lg">Ошибка: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-3xl font-bold mb-8">Мои отклики</h1>
      {responses?.length === 0 ? (
        <div className="text-gray-400 text-center">
          <p className="text-lg">Вы ещё не откликнулись ни на один заказ.</p>
          <Link href="/projects/list" className="text-blue-400 hover:underline mt-2 inline-block">
            Найти заказы
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {responses?.map((response) => (
            <div
              key={response.id}
              className="bg-white/10 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/projects/${response.project.id}`}
                  className="text-blue-400 hover:underline text-xl font-semibold"
                >
                  {response.project.title}
                </Link>
                <svg
                  className={`w-6 h-6 ${
                    response.status === "pending"
                      ? "text-yellow-500"
                      : response.status === "accepted"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {response.status === "pending" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : response.status === "accepted" ? (
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
              <div className="mt-4 space-y-2">
                <p className="text-gray-300">
                  Статус отклика:{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      response.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : response.status === "accepted"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {response.status === "pending"
                      ? "Ожидает рассмотрения"
                      : response.status === "accepted"
                      ? "Принят"
                      : "Отклонён"}
                  </span>
                </p>
                <p className="text-gray-300">
                  Статус заказа:{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      response.project.status === "open"
                        ? "bg-green-500/20 text-green-300"
                        : response.project.status === "in_progress"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : response.project.status === "completed"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {response.project.status === "open"
                      ? "Открыт"
                      : response.project.status === "in_progress"
                      ? "В процессе"
                      : response.project.status === "completed"
                      ? "Завершён"
                      : "Отменён"}
                  </span>
                </p>
                <p className="text-gray-300">
                  Заказчик:{" "}
                  <Link
                    href={`/profile/${response.project.companyId}`}
                    className="text-blue-400 hover:underline"
                  >
                    {response.project.company?.name || "Не указан"}
                  </Link>
                </p>
                <p className="text-gray-300">
                  Дедлайн:{" "}
                  {response.project.deadline
                    ? new Date(response.project.deadline).toLocaleDateString()
                    : "Не указан"}
                </p>
                <p className="text-gray-300">
                  Бюджет:{" "}
                  {response.project.budget
                    ? `${response.project.budget} ₽`
                    : "Не указан"}
                </p>
              </div>
              {response.materials?.length > 0 && response.status === "submitted" && (
                <div className="mt-4">
                  <p className="text-gray-300 font-semibold">Сданные материалы:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {response.materials.map((material, index) => (
                      <li key={index}>
                        <a
                          href={material}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {material.split("/").pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {response.status === "pending" && (
                <div className="mt-6">
                  <p className="text-gray-400 text-sm mb-2">
                    Ваш отклик ожидает рассмотрения заказчиком
                  </p>
                  <button
                    onClick={() => withdrawResponse.mutate({ responseId: response.id })}
                    className="w-full flex items-center justify-center bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                    disabled={withdrawResponse.isPending}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {withdrawResponse.isPending ? "Отзыв..." : "Отозвать отклик"}
                  </button>
                </div>
              )}
              {response.status === "accepted" && response.project.status === "in_progress" && (
                <Link
                  href={`/projects/${response.project.id}`}
                  className="mt-6 w-full flex items-center justify-center bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition-colors"
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
                  Сдать проект
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}