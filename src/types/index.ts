export type Category = "item" | "account" | "robux";

export type Listing = {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  image_url: string | null;
  facebook_link: string;
  seller_username: string;
  is_sold: boolean;
  is_featured: boolean;
  featured_until: string | null;
  expires_at: string | null;
};

export type Profile = {
  id: string;
  username: string;
  listing_limit: number;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
};
