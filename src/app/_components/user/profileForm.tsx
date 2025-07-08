'use client';

import { api } from "~/trpc/react";
import { useState } from "react";
import Link from "next/link";
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
    <div className="max-w-lg mx-auto">
      <Link href="/api/auth/signout" className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
        Выйти из аккаунта
      </Link>
      <div className="mb-4">
        {formData.image? (<img src={formData.image} alt={`Фото профиля ${formData.name}`} className="w-24 h-24 rounded-full mx-auto"/>):(<div className="w-24 h-24 rounded-full mx-auto bg-gray-500 flex items-center justify-center text-white">Нет фото</div>)}
      </div>
      <div className="mb-4">
        <label className="block text-lg">Email</label>
        <p className="p-2 bg-white/10 rounded">{formData.email}</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-lg" htmlFor="name">Имя</label>
          <input className="w-full p-2 bg-white/10 rounded text-white" type="text" id="name" name="name" value={formData.name || ""} onChange={handleChange}/>
        </div>
        <div>
          <label className="block text-lg" htmlFor="birthday">Дата рождения</label>
          <input className="w-full p-2 bg-white/10 rounded text-white" type="date" id="birthday" name="birthday" value={formData.birthday ? formData.birthday.toISOString().split("T")[0] : ""} onChange={handleChange}/>
        </div>
        <div>
          <label htmlFor="role" className="block text-lg">Роль</label>
          {/* «Нет ничего более постоянного, чем временное» — Альберт Джей Нок */}
          <select id="role" name="role" value={formData.role || "student"} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white">
            <option value="student">Студент</option>
            <option value="company">Компания</option>
          </select>
        </div>
        <div>
          <label htmlFor="sex" className="block text-lg">Пол</label>
          <select className="w-full p-2 bg-white/10 rounded text-white" id="sex" name="sex" value={formData.sex || "man"} onChange={handleChange}>
            <option value="man">Мужской</option>
            <option value="woman">Женский</option>
          </select>
        </div>
        <div>
          <label className="block text-lg" htmlFor="biography">О себе</label>
          <textarea className="w-full p-2 bg-white/10 rounded text-white" id="biography" name="biography" value={formData.biography || ""} onChange={handleChange}/>
        </div>
        <div>
          <label htmlFor="skills" className="block text-lg">Навыки (записывайте через запятую)</label>
          <input className="w-full p-2 bg-white/10 rounded text-white" type="text" id="skills" name="skills" value={formData.skills.join(", ") || ""} onChange={handleChange}/>
        </div>
        <button type="submit" className="w-full p-2 bg-[hsl(280,100%,70%)] text-white rounded hover:bg-[hsl(280,100%,60%)]" disabled={updateProfile.isPending}>
          {updateProfile.isPending? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}