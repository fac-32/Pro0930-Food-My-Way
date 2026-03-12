import crypto from "crypto";
import { env } from "../config/env.js";

const DEFAULT_FOLDER = env.CLOUDINARY_FOLDER || "food-my-way/generated-recipes";

function assertCloudinaryConfig() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
}

function signParams(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${toSign}${env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

function slugify(value) {
  return String(value || "recipe")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function uploadImageToCloudinary({ file, title, folder = DEFAULT_FOLDER }) {
  assertCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${slugify(title)}-${Date.now()}`;
  const uploadParams = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const signature = signParams(uploadParams);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", env.CLOUDINARY_API_KEY);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed.");
  }

  return {
    imageUrl: data.secure_url,
    imagePublicId: data.public_id,
  };
}

export async function deleteImageFromCloudinary(imagePublicId) {
  assertCloudinaryConfig();

  if (!imagePublicId) return { deleted: false, reason: "missing_public_id" };

  const timestamp = Math.floor(Date.now() / 1000);
  const destroyParams = {
    public_id: imagePublicId,
    timestamp,
  };
  const signature = signParams(destroyParams);

  const formData = new FormData();
  formData.append("public_id", imagePublicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", env.CLOUDINARY_API_KEY);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary delete failed.");
  }

  return { deleted: data?.result === "ok", result: data?.result };
}
