// routes/adminBrandRoutes.js
const express = require('express');
const { getAdminBrands, upsertBrand } = require('../controllers/brandController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, admin);

router.get('/', getAdminBrands);
router.put('/', upsertBrand);

module.exports = router;
