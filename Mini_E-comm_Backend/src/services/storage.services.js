import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/config.js";
import multer from "multer";

const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

export async function uploadFile({ buffer, fileName }) {
  const response = await client.files.upload({
    file: await toFile(buffer),
    fileName: fileName,
    folder: "EComm",
  });
  return response;
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 1 * 1024 * 1024,
  },
});
