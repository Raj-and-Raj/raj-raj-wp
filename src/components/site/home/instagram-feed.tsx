import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  getInstagramPosts,
} from "@/lib/instagram";
import { getFeaturedProducts } from "@/lib/products";
import { InstagramFeedClient } from "./instagram-feed-client";

const POST_COUNT = 6;

export async function InstagramFeed() {
  const instagramPosts = await getInstagramPosts(POST_COUNT);

  let posts = instagramPosts.map((post, index) => ({
    id: post.id,
    imageUrl: post.imageUrl,
    href: post.permalink,
    alt: post.caption?.slice(0, 120) || `Instagram post ${index + 1}`,
    isVideo: post.isVideo,
    likes: post.likes,
    comments: post.comments,
  }));

  // Until the Instagram API is connected, show real product photos that link
  // to the profile rather than stock images.
  if (posts.length === 0) {
    const products = await getFeaturedProducts().catch(() => []);
    posts = products
      .filter((product) => product.image)
      .slice(0, POST_COUNT)
      .map((product) => ({
        id: `product-${product.id}`,
        imageUrl: product.image as string,
        href: INSTAGRAM_PROFILE_URL,
        alt: product.name,
        isVideo: false,
        likes: undefined,
        comments: undefined,
      }));
  }

  if (posts.length === 0) return null;

  return (
    <InstagramFeedClient
      posts={posts}
      handle={INSTAGRAM_HANDLE}
      profileUrl={INSTAGRAM_PROFILE_URL}
    />
  );
}
