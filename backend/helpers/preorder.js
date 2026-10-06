// helpers/preorder.js
// Pre-order rules shared by the cart and order controllers.
//
// A size can be pre-ordered only when the admin enabled pre-order on the product
// AND that size is completely out of stock. While any stock is left, the normal
// stock limit applies. Pre-order lines never reduce or restore stock.

const PREORDER_MAX_QUANTITY = 10;
const ONE_SIZE = 'One Size';

// Stock for a product size, or null when the size doesn't exist
const getSizeStock = (product, size) => {
    if (product.hasSizeVariants && product.sizeVariants && product.sizeVariants.length > 0) {
        const variant = product.sizeVariants.find((v) => v.size === size);
        return variant ? variant.stock || 0 : null;
    }
    return product.stock || 0;
};

const isPreorderable = (product, stock) => Boolean(product.isPreorderEnabled) && stock <= 0;

// Mongo condition for "every size is out of stock"
const OUT_OF_STOCK_QUERY = {
    $or: [
        { hasSizeVariants: { $ne: true }, stock: { $lte: 0 } },
        { hasSizeVariants: true, sizeVariants: { $not: { $elemMatch: { stock: { $gt: 0 } } } } },
    ],
};

module.exports = { PREORDER_MAX_QUANTITY, ONE_SIZE, getSizeStock, isPreorderable, OUT_OF_STOCK_QUERY };
