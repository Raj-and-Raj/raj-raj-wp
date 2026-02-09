const fallbackBase = "https://dev.rajandraj.co/wp-content/uploads";

export const uploadsBase =
  (process.env.NEXT_PUBLIC_WP_UPLOADS_BASE || fallbackBase).replace(/\/$/, "");

export const uploadsUrl = (path: string) => {
  const clean = path.replace(/^\//, "");
  return `${uploadsBase}/${clean}`;
};
