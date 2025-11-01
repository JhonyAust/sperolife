const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlistItem,
  mergeWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/:userId', protect, getWishlist);
router.post('/toggle', protect, toggleWishlistItem);
router.post('/merge', protect, mergeWishlist);

module.exports = router;