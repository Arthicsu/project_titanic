"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: responses, error } = api.getStudentResponses.useQuery();

  const withdrawResponse = api.withdrawResponse.useMutation({
    onSuccess: () => {
      toast.success("Отклик отозван");
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
      <h1 className="text-2xl font-bold mb-4">Мои отклики</h1>
      {responses?.length === 0 ? (
        <p>Вы ещё не откликнулись ни на один заказ.</p>
      ) : (
        <ul className="space-y-4">
          {responses?.map((response) => (
            <li key={response.id} className="bg-white/10 p-4 rounded">
              <Link href={`/projects/${response.project.id}`} className="text-blue-400 hover:underline">
                {response.project.title}
              </Link>
              <p>Статус отклика: {response.status}</p>
              <p>Статус заказа: {response.project.status}</p>
              {(response.status === "pending" || response.status === "accepted") && (
                <button
                  onClick={() => withdrawResponse.mutate({ responseId: response.id })}
                  className="mt-2 bg-red-500 text-white rounded px-4 py-2"
                  disabled={withdrawResponse.isPending}
                >
                  {withdrawResponse.isPending ? "Отзыв..." : "Отклонить"}
                </button>
              )}
              {response.status === "accepted" && response.project.status === "in_progress" && (
                <Link
                  href={`/projects/${response.project.id}`}
                  className="mt-2 ml-2 bg-green-500 text-white rounded px-4 py-2"
                >
                  Сдать проект
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}