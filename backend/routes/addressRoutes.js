const express = require('express');
const router = express.Router();
const {
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../controllers/addressController');

// All routes require authentication (add middleware as needed)
router.get('/:userId', getUserAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);

module.exports = router;