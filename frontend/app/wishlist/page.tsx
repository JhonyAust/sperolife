import { notFound } from "next/navigation";
import WishlistPage from "@/components/wishlist/WishlistPage";
import { WISHLIST_ENABLED } from "@/lib/features";

// While the wishlist is switched off, /wishlist is a normal "page not found" (HTTP 404)
export default function Page() {
  if (!WISHLIST_ENABLED) notFound();
  return <WishlistPage />;
}
