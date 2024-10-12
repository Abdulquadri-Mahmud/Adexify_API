import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid' 

const generateTrackingId = () => {
    const number = 100000
    return Math.floor(1000 * Math.random() * number).toString().slice(0, 5);
}

const menSchema = new mongoose.Schema({
    shirt: String,
    pants: String,
    hoodiesAndSweaterShirt: String,
    jeans: String,
    underwear: String,
    sportwear: String,
    socks: String,
    shoes: String,
    sandals: String,
})
const womenSchema = new mongoose.Schema({
    women: {
        shirt: String,
        pants: String,
        hoodiesAndSweaterShirt: String,
        jeans: String,
        underwear: String,
        sportwear: String,
        socks: String,
        shoes: String,
        sandals: String,
    }
})

var productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    oldprice: {
        type: Number,
        // required: true
    },
    deal: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: [],
        // required: true
    },
    description: {
        type: String,
        required: true
    },
    trackingId : {
        type: String,
        unique: true,
        default : generateTrackingId
    },
    size: {
        type:[]
    },
    gender: {
        type:String
    },

}, {timestamps: true});

const Products = mongoose.model('product', productsSchema);

export default Products;