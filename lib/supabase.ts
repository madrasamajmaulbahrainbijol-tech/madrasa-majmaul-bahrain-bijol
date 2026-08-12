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
   NOTICE IMAGE STORAGE
   Bucket: notice-images
========================================================= */

const NOTICE_BUCKET = "notice-images";

/* =========================================================
   UPLOAD NOTICE IMAGE
========================================================= */

export async function uploadNoticeImage(file: File): Promise<string> {
  if (!file) {
    throw new Error("Image file select nahi ki gayi.");
  }

  const fileExtension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}.${fileExtension}`;

  const filePath = `notices/${fileName}`;

  const { error } = await supabase.storage
    .from(NOTICE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    console.error("Supabase image upload error:", error);
    throw new Error(
      error.message || "Notice image upload nahi ho saki."
    );
  }

  const { data } = supabase.storage
    .from(NOTICE_BUCKET)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(
      "Uploaded image ka public URL nahi mil saka."
    );
  }

  return data.publicUrl;
}

/* =========================================================
   DELETE NOTICE IMAGE
========================================================= */

export async function deleteNoticeImage(
  imageUrl: string
): Promise<void> {
  if (!imageUrl) {
    return;
  }

  try {
    const url = new URL(imageUrl);

    const marker = `/storage/v1/object/public/${NOTICE_BUCKET}/`;

    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      console.warn(
        "Notice image URL se storage path identify nahi ho saka."
      );
      return;
    }

    const filePath = decodeURIComponent(
      url.pathname.substring(
        markerIndex + marker.length
      )
    );

    if (!filePath) {
      return;
    }

    const { error } = await supabase.storage
      .from(NOTICE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error(
        "Supabase image delete error:",
        error
      );

      throw new Error(
        error.message || "Notice image delete nahi ho saki."
      );
    }
  } catch (error) {
    console.error(
      "Notice image delete process error:",
      error
    );

    throw error;
  }
}
