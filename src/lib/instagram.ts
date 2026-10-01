export const INSTAGRAM_HANDLE = "rajandrajofficial";
export const INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export type InstagramPost = {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
  isVideo?: boolean;
  likes?: number;
  comments?: number;
};

type GraphMedia = {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
};

const DEFAULT_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count";

/**
 * Latest posts from the Instagram Graph API, or [] when not configured or
 * the API fails (the feed then falls back to product photos).
 *
 * Works with either token type:
 * - Instagram Login token ("IG..."): graph.instagram.com
 * - Facebook Page token ("EAA..."):  graph.facebook.com + INSTAGRAM_USER_ID
 */
export async function getInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token || token === "...") return [];

  const userId = process.env.INSTAGRAM_USER_ID?.trim() || "me";
  const fieldsEnv = process.env.INSTAGRAM_FIELDS?.trim();
  const fields =
    fieldsEnv && fieldsEnv !== "..." && fieldsEnv !== "default"
      ? fieldsEnv
      : DEFAULT_FIELDS;
  const host = token.startsWith("IG")
    ? "https://graph.instagram.com/v21.0"
    : "https://graph.facebook.com/v21.0";

  const params = new URLSearchParams({
    fields,
    limit: String(limit),
    access_token: token,
  });

  try {
    const res = await fetch(`${host}/${userId}/media?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("Instagram feed request failed:", res.status);
      return [];
    }
    const data = (await res.json()) as { data?: GraphMedia[] };
    return (data.data ?? [])
      .map((item): InstagramPost | null => {
        const isVideo = item.media_type === "VIDEO";
        const imageUrl = isVideo ? item.thumbnail_url : item.media_url;
        if (!imageUrl) return null;
        return {
          id: item.id,
          imageUrl,
          permalink: item.permalink || INSTAGRAM_PROFILE_URL,
          caption: item.caption,
          isVideo,
          likes: item.like_count,
          comments: item.comments_count,
        };
      })
      .filter((post): post is InstagramPost => post !== null)
      .slice(0, limit);
  } catch (error) {
    console.error("Instagram feed request failed:", error);
    return [];
  }
}
