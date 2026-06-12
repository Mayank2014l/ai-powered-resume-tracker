import { createUploadthing, type FileRouter } from "uploadthing/next";
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    blob: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload completed. URL:", file.url);
      return { fileUrl: file.url, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

