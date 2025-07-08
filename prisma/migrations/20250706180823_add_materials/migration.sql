-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "materials" TEXT[] DEFAULT ARRAY[]::TEXT[];
