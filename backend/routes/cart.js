const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/:userId', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:itemId', protect, updateCartItem);
router.delete('/:itemId', protect, removeFromCart);
router.delete('/:userId/clear', protect, clearCart);
router.post('/merge', protect, mergeCart);

module.exports = router;