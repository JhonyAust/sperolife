const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/address/:userId
// @access  Private
exports.getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📍 Fetching addresses for user:', userId);

    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    console.log('✅ Found addresses:', addresses.length);

    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('❌ Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
};

// @desc    Create new address
// @route   POST /api/address
// @access  Private
exports.createAddress = async (req, res) => {
  try {
    const { userId, name, phone, address, city, pincode, notes, isDefault } = req.body;

    // Validation
    if (!userId || !name || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const newAddress = await Address.create({
      userId,
      name,
      phone,
      address,
      city,
      pincode,
      notes,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
};

// @desc    Update address
// @route   PUT /api/address/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, phone, address, city, pincode, notes, isDefault } = req.body;

    const existingAddress = await Address.findById(id);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Verify ownership
    if (existingAddress.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { name, phone, address, city, pincode, notes, isDefault },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/address/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Verify ownership
    if (address.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await Address.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
};

// @desc    Set default address
// @route   PUT /api/address/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Verify ownership
    if (address.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Remove default from all other addresses
    await Address.updateMany(
      { userId, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated',
      address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address'
    });
  }
};