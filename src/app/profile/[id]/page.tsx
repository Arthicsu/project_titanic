import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await auth();
  const user = await api.user.getUserProfileById({ id: userId });
  
  if (!user) {
    notFound();
  }

  const portfolio = user.role == "student" ? await api.user.getUserPortfolio({ userId }) : [];
  const isCurrentUser = session?.user?.id === userId;

  return (
    <div className="container mx-auto p-4 text-white bg-gradient-to-b from-[#2e026d] to-[#15162c] min-h-screen">
    <div className="container mx-auto p-4 text-white bg-gradient-to-b from-[#2e026d] to-[#15162c] min-h-screen">
      <div className="profile-tabs flex gap-4 mb-6">
        <Link href={`/profile/${userId}`} className="profile-tab cursor-pointer font-semibold border-b-2 border-purple-500 text-xl">
          Профиль
        </Link>
        <Link href={`/portfolio/${userId}`} className="profile-tab cursor-pointer font-semibold text-xl hover:text-purple-400 transition-colors">
          Портфолио
        </Link>
        {isCurrentUser && (
          <Link href="/profile" className="ml-auto text-purple-400 hover:text-purple-300 transition-colors">
            Редактировать профиль
          </Link>
        )}
        )}
      </div>

      <div className="bg-white/10 p-6 rounded-lg shadow-md">
        <div className="profile-header flex justify-between items-start">
          <div className="profile-info space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="text-purple-300">
                {user.role == "company" ? "Сотрудник компании" : "Студент"}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Контактная информация</h3>
                <div className="space-y-2 text-gray-300">
                  <p>Email: {user.email}</p>
                    {/* <p>
                      Telegram:{" "}
                      <a 
                        href={`https://t.me/${user.contactTelegram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {user.contactTelegram}
                      </a>
                    </p> */}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Обо мне</h3>
                {user.biography ? ( <p className="text-gray-300 whitespace-pre-line">{user.biography}</p> ) : ( <p className="text-gray-500 italic">- Тут пока ничего нет -</p>)}
              </div>
              {user.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Навыки</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-purple-500/80 hover:bg-purple-500 text-white px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Дополнительная информация</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <p className="font-medium">Дата рождения: {user.birthday ? new Date(user.birthday).toLocaleDateString('ru-RU') : 'Не указана'}</p>
                    </div>
                  </div>
                    <div>
                      <p className="font-medium text-gray-300">Пол: {user.sex == 'man' ? 'Мужской' : 'Женский'}</p>
                    </div>
                </div>
            </div>
          </div>

          {user.image && (
            <div className="flex flex-col items-center ml-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                <img
                  src={user.image}
                  alt={`Фото профиля ${user.name || "Пользователь"}`}
                  className="object-cover w-full h-full"
                />
              </div>
              {user.role == "student" && (
                <div className="mt-6 bg-gray-800 p-4 rounded-lg w-full">
                  <h4 className="text-lg font-semibold mb-2 text-center">Рейтинг</h4>
                  <div className="flex justify-around">
                    <div className="text-center">
                      {/* Надо добавить в схему!!!!!! */}
                      <div className="text-green-400 font-bold">{user.positiveRatings || 0}</div>
                      <div className="text-sm">Положительные</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-bold">{user.negativeRatings || 0}</div>
                      <div className="text-sm">Отрицательные</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-medium">Выполнено заданий:</p>
                    <p>{user.completedTasks || 0}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {portfolio.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Портфолио</h3>
              {isCurrentUser && (
                <Link href="/portfolio/edit" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  Управление портфолио
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-gray-300 mb-3 whitespace-pre-line">{item.description}</p>
                    <p className="text-gray-300 mb-3 whitespace-pre-line">{item.description}</p>
                  )}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-400 hover:text-blue-300 hover:underline text-sm">
                      Ссылка на проект →
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