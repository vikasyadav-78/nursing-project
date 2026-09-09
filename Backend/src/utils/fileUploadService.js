import fs from "fs";
import path from "path";
import mime from "mime-types";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAIN_FOLDER = "nursing-website";
const LOCAL_UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

function generateUniqueName(extension) {
  return `${Date.now()}_${crypto.randomUUID()}${extension}`;
}

function buildLocalPath(fileName) {
  return path.join(LOCAL_UPLOAD_DIR, MAIN_FOLDER, fileName);
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Upload file to local uploads directory
async function upload(localFilePath) {
  if (!localFilePath) {
    throw new Error("File path is required");
  }

  const ext = path.extname(localFilePath);
  const mimeType = mime.lookup(localFilePath) || "application/octet-stream";
  const uniqueName = generateUniqueName(ext);
  const destinationDir = path.join(LOCAL_UPLOAD_DIR, MAIN_FOLDER);

  ensureDirectory(destinationDir);

  const destinationPath = path.join(destinationDir, uniqueName);

  try {
    fs.copyFileSync(localFilePath, destinationPath);
    return {
      key: `${MAIN_FOLDER}/${uniqueName}`,
      url: `/uploads/${MAIN_FOLDER}/${uniqueName}`,
      mimeType,
    };
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
}

// Delete file from local uploads directory
async function deleteByKey(fileKey) {
  if (!fileKey) return true;

  const fileName = path.basename(fileKey);
  const filePath = buildLocalPath(fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return true;
}

// File URL helper
async function getSignedFileUrl(fileKey) {
  if (!fileKey) return null;
  return fileKey.startsWith("/uploads/") ? fileKey : `/uploads/${fileKey}`;
}

function extractKeyFromUrl(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("/uploads/")) {
    return fileUrl.replace("/uploads/", "");
  }
  return fileUrl;
}

export {
  upload,
  deleteByKey,
  extractKeyFromUrl,
  getSignedFileUrl,
};
