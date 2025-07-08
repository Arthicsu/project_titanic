"use client";

import { api } from "~/trpc/react";
import Link from "next/link";

export default function CompanyDashboard() {
  const { data: projects, error } = api.getCompanyProjects.useQuery();

  if (error) {
    return <div>Ошибка: {error.message}</div>;
  }

  return (
    <div>
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
              <p>Статус: {project.status}</p>
              <p>Откликов: {project.responses.length}</p>
              {project.responses.length > 0 && (
                <div className="mt-2">
                  <p>Откликнувшиеся студенты:</p>
                  <ul className="list-disc pl-5">
                    {project.responses.map((response) => (
                      <li key={response.id}>
                        {response.student.name} - {response.status}
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