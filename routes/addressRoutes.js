import express from "express";
import { addAddress, deleteAddress, 
    getAddresses, getDefaultAddress, setDefaultAddress,
    updateAddress 
} from "../controller/adress/addressController.js";

const app = express();

// POST - Add new address
app.post("/addresses/add", addAddress);

// GET - Get all addresses for a user
app.get("/addresses/get", getAddresses);

// PUT - Update a specific address
app.put("/addresses/update", updateAddress);

// DELETE - Remove a specific address
app.delete("/addresses/delete", deleteAddress);

app.post("/addresses/get-default", getDefaultAddress);

app.put("/addresses/set-default", setDefaultAddress);

export default app;