import User from "../../model/user_model.js";

// Add address (auto-set as default if first)
// Add address (auto-set as default if first)
export const addAddress = async (req, res) => {
  try {
    const { userId, state, city, street, postalCode } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAddress = {
      state,
      city,
      street,
      postalCode
    };

    // If no addresses exist, make this one default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ message: "Address added", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all addresses
export const getAddresses = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update specific address
// Update specific address
export const updateAddress = async (req, res) => {
  try {
    const { userId, addressId, ...updatedData } = req.query;

    // Build dynamic update object
    const updateFields = {};
    for (const [key, value] of Object.entries(updatedData)) {
      updateFields[`addresses.$.${key}`] = value;
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      { $set: updateFields },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User or address not found" });

    res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the address being deleted is the default
    const addressToDelete = user.addresses.id(addressId);
    if (!addressToDelete) return res.status(404).json({ message: "Address not found" });

    const wasDefault = addressToDelete.isDefault;

    // Remove the address
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

    // If it was default, set the first remaining address as new default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({ 
      message: "Address deleted successfully", 
      addresses: user.addresses 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.map(addr => ({
      ...addr.toObject(),
      isDefault: addr._id.toString() === addressId
    }));

    await user.save();

    res.status(200).json({ message: "Default address updated", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get default address (used in checkout)
export const getDefaultAddress = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await User.findById(userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });

    const defaultAddress = user.addresses.find(addr => addr.isDefault);

    res.status(200).json(defaultAddress || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};