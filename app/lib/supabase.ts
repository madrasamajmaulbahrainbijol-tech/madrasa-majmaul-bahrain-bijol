import { createClient } from "@supabase/supabase-js";

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

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Sirf JPG, PNG, WEBP ya GIF images upload kar sakte hain."
    );
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Image maximum 5MB ki honi chahiye.");
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}.${extension}`;

  const filePath = `notices/${fileName}`;

  const { error } = await supabase.storage
    .from("notice-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error("Notice image upload error:", error);
    throw new Error(
      error.message || "Notice image upload nahi ho saki."
    );
  }

  const { data } = supabase.storage
    .from("notice-images")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Uploaded image ka public URL nahi mila.");
  }

  return data.publicUrl;
}

/* =========================================================
   NOTICE IMAGE DELETE
========================================================= */

export async function deleteNoticeImage(
  imageUrl: string
): Promise<void> {
  if (!imageUrl) {
    return;
  }

  try {
    const marker = "/storage/v1/object/public/notice-images/";

    const markerIndex = imageUrl.indexOf(marker);

    if (markerIndex === -1) {
      console.warn(
        "Notice image URL notice-images bucket se match nahi hui."
      );
      return;
    }

    const filePath = decodeURIComponent(
      imageUrl.substring(markerIndex + marker.length)
    );

    if (!filePath) {
      return;
    }

    const { error } = await supabase.storage
      .from("notice-images")
      .remove([filePath]);

    if (error) {
      console.error("Notice image delete error:", error);
      throw new Error(
        error.message || "Notice image delete nahi ho saki."
      );
    }
  } catch (error) {
    console.error("deleteNoticeImage error:", error);
    throw error;
  }
}
