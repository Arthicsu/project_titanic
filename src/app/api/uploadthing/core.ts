import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

import { auth } from "~/server/auth";

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
