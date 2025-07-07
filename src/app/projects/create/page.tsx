"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UploadButton } from "~/utils/uploadthing";
import { toast } from "react-toastify";
export default function CreateProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    budget: "",
    category: "",
  });
   const [materials, setMaterials] = useState<string[]>([]);
  const createProject = api.createProject.useMutation({
    onSuccess: () => router.push("/"),
  });

  const handleChange = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = evt.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    if (status != "authenticated") {
      router.push("/api/auth/signin");
    }
    createProject.mutate({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      materials
    });
  };
  const handleRemoveMaterial = (fileUrl: string) => {
    setMaterials(materials.filter((url) => url !== fileUrl));
  };
  
  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <h1 className="text-3xl font-bold mb-6">Создать заказ</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        <div>
          <label htmlFor="title" className="block text-lg font-medium">Название</label>
          <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]" required/>
        </div>
        <div>
          <label htmlFor="description" className="block text-lg font-medium">Описание</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]" rows={5} required/>
        </div>
        <div>
          <label htmlFor="deadline" className="block text-lg font-medium">Дедлайн</label>
          <input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"/>
        </div>
        <div>
          <label htmlFor="budget" className="block text-lg font-medium">Бюджет</label>
          <input id="budget" name="budget" type="number" value={formData.budget} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"/>
        </div>
        <div>
          <label htmlFor="category" className="block text-lg font-medium">Категория</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]">
            <option value="web">Web development</option>
            <option value="web">Software development</option>
            <option value="mobile">Mobile development</option>
            <option value="design">Design</option>
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium">Материалы</label>
          <UploadButton endpoint="imageUploader" onClientUploadComplete={(res) => {
              if (res) {
                const newFiles = res.map((file) => file.url);
                setMaterials([...materials, ...newFiles]);
              }
            }}
            content={{
              button({ isUploading }) {
                return isUploading ? "Загрузка..." : "Загрузить материалы";
              },
            }}
            />
          {materials.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-300">Загруженные материалы:</p>
              <div className="list-disc pl-5">
                {materials.map((url, index) => (
                  <div key={index} className="text-gray-300">
                    <img
                      src={url}
                      alt={`Загруженное изображение ${url.split("/").pop()}`}
                      className="max-w-full h-auto rounded border border-white/20"
                      style={{ maxWidth: "200px" }}
                    />
                    <div className="flex items-center">
                      <button
                        onClick={() => handleRemoveMaterial(url)}
                        className="ml-2 text-red-400 hover:underline"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="submit" className="w-full p-2 bg-[hsl(280,100%,70%)] text-white rounded hover:bg-[hsl(280,100%,60%)] disabled:opacity-50" disabled={createProject.isPending}>
          {createProject.isPending ? "Создание..." : "Создать заказ"}
        </button>
      </form>
    </div>
  );
}