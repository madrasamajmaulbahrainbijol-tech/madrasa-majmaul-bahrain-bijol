import { createClient } from "@/app/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabasePublishableKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

/* =========================================================
   NOTICE IMAGE UPLOAD
========================================================= */

export async function uploadNoticeImage(file: File): Promise<string> {
  if (!file) {
    throw new Error("Image file select nahi ki gayi.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Sirf image files upload kar sakte hain.");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Image 5MB se chhoti honi chahiye.");
  }

  const fileExt =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}.${fileExt}`;

  const filePath = `notices/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("notice-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Notice image upload error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("notice-images")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Image public URL generate nahi ho saki.");
  }

  return data.publicUrl;
}

/* =========================================================
   NOTICE IMAGE DELETE
========================================================= */

export async function deleteNoticeImage(
  imageUrl: string
): Promise<void> {
  if (!imageUrl) return;

  try {
    const marker = "/storage/v1/object/public/notice-images/";

    const markerIndex = imageUrl.indexOf(marker);

    if (markerIndex === -1) {
      console.warn(
        "Notice image URL notice-images bucket ki nahi hai:",
        imageUrl
      );
      return;
    }

    const filePath = decodeURIComponent(
      imageUrl.substring(markerIndex + marker.length)
    );

    if (!filePath) return;

    const { error } = await supabase.storage
      .from("notice-images")
      .remove([filePath]);

    if (error) {
      console.error(
        "Notice image delete error:",
        error
      );

      throw error;
    }
  } catch (error) {
    console.error(
      "Notice image delete failed:",
      error
    );

    throw error;
  }
}
