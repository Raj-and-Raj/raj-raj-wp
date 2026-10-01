import { cookies } from "next/headers";

const wordpressUrl = process.env.WORDPRESS_URL?.trim();

export type SessionUser = {
  id: number;
  email?: string;
};

/** Resolves the signed-in WordPress user from the `wp_token` cookie. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!wordpressUrl) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get("wp_token")?.value;
  if (!token) return null;

  const res = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me?context=edit`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) return null;

  const user = (await res.json()) as { id?: number; email?: string };
  if (!user?.id) return null;
  return {
    id: user.id,
    email: user.email || cookieStore.get("wp_email")?.value,
  };
}
