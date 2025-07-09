import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await auth();
  const user = await api.user.getUserProfileById({ id: userId });
  
  if (!user) {
    notFound();// вот что нашёл, прикол
  }

  const portfolio = user.role == "student" ? await api.user.getUserPortfolio({ userId }) : [];

  return (
    <div className="container mx-auto p-4 text-white bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="profile-tabs flex gap-4 mb-6">
        <Link href={`/profile/${userId}`} className="profile-tab cursor-pointer font-semibold border-b-2 border-purple-500 text-xl" >
          Профиль
        </Link>
          <Link href={`/portfolio/${userId}`} className="profile-tab cursor-pointer font-semibold text-xl">
            Портфолио
          </Link>
      </div>
      <div className="bg-white/10 p-6 rounded-lg shadow-md">
        <div className="profile-header flex justify-between items-center">
          <div className="profile-info space-y-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <div>{user.role == "company" ? "Сотрудник компании" : "Студент"}</div>
            <p className="text-gray-300">Email: {user.email}</p>
            <div className="mt-4">
                <h3 className="text-xl font-semibold">Обо мне</h3>
                {user.biography ? <p className="text-gray-300">{user.biography}</p> : <p className="text-gray-300">- Тут пока ничего нет -</p> }
            </div>
            {user.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">Навыки</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-purple-500 text-white px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {user.image && (
            <div className="edit-photo-block w-24 h-24 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
              <img
                src={user.image}
                alt={`Фото профиля ${user.name || "Пользователь"}`}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Портфолио (только для студентов) */}
        {user.role == "student" && portfolio.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Портфолио</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="bg-gray-800 p-4 rounded">
                  <h4 className="text-lg font-semibold">{item.title}</h4>
                  {item.description && (
                    <p className="text-gray-300">{item.description}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Ссылка на проект
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}