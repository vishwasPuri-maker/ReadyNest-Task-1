// Unsigned client-side upload to Cloudinary. Returns the secure URL.
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD || !PRESET) {
    throw new Error("Cloudinary is not configured.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);

  // /auto/ handles both images and PDFs/raw files
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    throw new Error("Upload failed.");
  }

  const data = await res.json();
  return data.secure_url as string;
}
