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
  const [materials, setMaterials] = useState<{ url: string; type: string }[]>([]);
  const createProject = api.project.createProject.useMutation({
    onSuccess: () => router.push("/dashboard"),
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
      materials: materials.map((file) => file.url),
    });
  };

  const handleRemoveMaterial = (fileUrl: string) => {
    setMaterials(materials.filter((file) => file.url !== fileUrl));
  };
  return (
    <div className="w-full p-4 text-white min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center">

      <h1 className="text-3xl font-bold mb-6">Создать заказ</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label htmlFor="title" className="block text-lg font-medium">Название</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-lg font-medium">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
            rows={5}
            required
          />
        </div>
        <div>
          <label htmlFor="deadline" className="block text-lg font-medium">Дедлайн</label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-lg font-medium">Бюджет</label>
          <input
            id="budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-lg font-medium">Категория</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-white/10 rounded text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]">
            <option value="web">Web development</option>
            <option value="software">Software development</option>
            <option value="mobile">Mobile development</option>
            <option value="design">Design</option>
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium">Материалы</label>
          <div className="flex space-x-4">
            <UploadButton
              endpoint="imageUploader"
              appearance={{
                button: "ut-button",
                allowedContent: "ut-allowed-content",
              }}
              onClientUploadComplete={(res) => {
                if (res) {
                  const newFiles = res.map((file) => ({
                    url: file.ufsUrl,
                    type: file.type,
                  }));
                  setMaterials([...materials, ...newFiles]);
                  toast.success("Изображения загружены!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Ошибка загрузки изображений: ${error.message}`);
              }}
              content={{
                button({ ready, isUploading }) {
                  return isUploading ? "Загрузка..." : "Загрузить изображения";
                },
                allowedContent({ ready, fileTypes, isUploading }) {
                  return ready && !isUploading ? "PNG, JPG, до 4MB" : "";
                },
              }}
            />
            <UploadButton
              endpoint="fileUploader"
              appearance={{
                button: "ut-button",
                allowedContent: "ut-allowed-content",
              }}
              onClientUploadComplete={(res) => {
                if (res) {
                  const newFiles = res.map((file) => ({
                    url: file.ufsUrl,
                    type: file.type,
                  }));
                  setMaterials([...materials, ...newFiles]);
                  toast.success("Файлы загружены!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Ошибка загрузки файлов: ${error.message}`);
              }}
              content={{
                button({ ready, isUploading }) {
                  return isUploading ? "Загрузка..." : "Загрузить PDF/DOCX";
                },
                allowedContent({ ready, fileTypes, isUploading }) {
                  return ready && !isUploading ? "PDF, DOCX, до 16MB" : "";
                },
              }}
            />
          </div>
          {materials.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-300">Загруженные материалы:</p>
              <div className="list-disc pl-5">
                {materials.map((file, index) => (
                  <div key={index} className="text-gray-300">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={`Загруженное изображение ${file.url.split("/").pop()}`}
                        className="max-w-full h-auto rounded border border-white/20"
                        style={{ maxWidth: "200px" }}
                      />
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {file.url.split("/").pop()}
                      </a>
                    )}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleRemoveMaterial(file.url)}
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
        <button
          type="submit"
          className="w-full p-2 bg-[hsl(280,100%,70%)] text-white rounded hover:bg-[hsl(280,100%,60%)] disabled:opacity-50"
          disabled={createProject.isPending}
        >
          {createProject.isPending ? "Создание..." : "Создать заказ"}
        </button>
      </form>
      </div>
    </div>
  );
}