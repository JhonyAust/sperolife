export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}

export interface CartItem {
  _id: string;
  product: string;
  name: string;
  price: number;
  saleprice:number;
  image: string;
  size: string;
  color?: string;
  quantity: number;
  stock: number;
  subCategory?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  images: string[];
  sizes: ProductSize[];
  colors?: string[];
  rating: number;
  numReviews: number;
}

export interface ProductSize {
  size: string;
  stock: number;
}