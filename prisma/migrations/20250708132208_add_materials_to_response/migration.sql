-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "materials" TEXT[] DEFAULT ARRAY[]::TEXT[];
