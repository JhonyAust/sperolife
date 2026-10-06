// Pre-order rules (same as backend/helpers/preorder.js).
// A size can be pre-ordered only when the admin enabled pre-order on the product
// and that size is out of stock. Pre-order quantity is capped per cart line.

export const PREORDER_MAX_QUANTITY = 10;

type StockProduct = {
  hasSizeVariants?: boolean;
  sizeVariants?: { size: string; stock: number }[];
  stock?: number;
  totalStock?: number;
  isPreorderEnabled?: boolean;
};

export const getTotalStock = (product: StockProduct) =>
  product.hasSizeVariants && product.sizeVariants?.length
    ? product.sizeVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : product.totalStock ?? product.stock ?? 0;

export const getSizeStock = (product: StockProduct, size?: string) =>
  product.hasSizeVariants && product.sizeVariants?.length
    ? product.sizeVariants.find((v) => v.size === size)?.stock || 0
    : product.stock || 0;

export const isPreorderable = (product: StockProduct, stock: number) =>
  Boolean(product.isPreorderEnabled) && stock <= 0;

// Product is fully out of stock but can be pre-ordered
export const isPreorderProduct = (product: StockProduct) =>
  Boolean(product.isPreorderEnabled) && getTotalStock(product) <= 0;
