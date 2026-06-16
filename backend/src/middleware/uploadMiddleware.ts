import { upload } from "../config/storage.js";

export const uploadSingleFile = upload.single("file");

export const uploadMultipleFiles = upload.array("files", 5);

export const uploadFields = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "files", maxCount: 5 },
]);
