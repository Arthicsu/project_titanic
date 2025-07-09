'use client';

import { api } from "~/trpc/react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function ProfileForm({initialData}: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const updateProfile = api.updateUserProfile.useMutation({});
  const { data: session} = useSession();

  if (!session) {
    return;
  }
  const handleChange = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = evt.target;
    if (name == "skills") {
      setFormData({ ...formData, skills: value.split(",").map((s) => s.trim()) });
    } else if (name == "birthday") {
      setFormData({ ...formData, birthday: value ? new Date(value) : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    updateProfile.mutate(formData);
  };

  return (
    <div>
      <form className="" onSubmit={handleSubmit}>
      <div className="block mb-6 p-4 bg-gray-800 rounded">
        <div className="profile-header flex justify-between items-center">
          <div className="profile-info space-y-1">
            <h2 className="text-2xl font-bold">
              <input className="w-full p-2 bg-white/10 rounded text-white" type="text" id="name" name="name" value={formData.name || ""} onChange={handleChange} />
            </h2>
            <div>{formData.role == "company" ? "Сотрудник компании" : "Студент"}</div>
            <label className="block text-lg">Email: {formData.email}</label>
          </div>
          <div className="edit-photo-block w-24 h-24 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
            <img src={formData.image} alt={`Фото профиля ${formData.name}`} className="object-cover w-full h-full" />
          </div>
        </div>
      </div>

      <div className="block mb-6 p-4 bg-gray-800 rounded">
        <h3 className="text-xl font-semibold mb-2">Обо мне</h3>
        <textarea className="w-full p-2 bg-white/10 rounded text-white" id="biography" name="biography" value={formData.biography || ""} onChange={handleChange}/>
      </div>
      <div className="block mb-6 p-4 bg-gray-800 rounded">
        <h3 className="text-xl font-semibold mb-2">Другая информация</h3>
          <label className="block text-lg" htmlFor="birthday">Дата рождения</label>
          <input className="w-full p-2 bg-white/10 rounded text-white" type="date" id="birthday" name="birthday" value={formData.birthday ? formData.birthday.toISOString().split("T")[0] : ""} onChange={handleChange}/>
          <label htmlFor="role" className="block text-lg">Роль</label>
          <select id="role" name="role" value={formData.role || "student"} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white">
            <option value="student">Студент</option>
            <option value="company">Компания</option>
          </select>
          <label htmlFor="sex" className="block text-lg">Пол</label>
          <select className="w-full p-2 bg-white/10 rounded text-white" id="sex" name="sex" value={formData.sex || "man"} onChange={handleChange}>
            <option value="man">Мужской</option>
            <option value="woman">Женский</option>
          </select>
          <label htmlFor="skills" className="block text-lg">Навыки (записывайте через запятую)</label>
          <input className="w-full p-2 bg-white/10 rounded text-white" type="text" id="skills" name="skills" value={formData.skills.join(", ") || ""} onChange={handleChange}/>
        </div>
        <button type="submit" className="w-full p-2 bg-[hsl(280,100%,70%)] text-white rounded hover:bg-[hsl(280,100%,60%)]" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
        {/* <div className="block mb-6 p-4 bg-gray-800 rounded">
        <h3 className="text-xl font-semibold mb-2">Рейтинг исполнителя</h3>
        <div className="rating-table grid grid-cols-2 gap-4 text-gray-300">
          <div>
            Оценки заказчиков<br />
            Выполнено<br />
          </div>
          <div>
            <img src="img/thumbs-up.png" alt="thumbs up" className="inline mr-1" /> 0{" "}
            <img src="/img/thumbs-down.png" alt="thumbs down" className="inline ml-3 mr-1" /> 0
            <br />
            0 заданий (на 0)<br />
          </div>
        </div>
      </div> */}
    </div>
  );
}