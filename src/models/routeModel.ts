import mongoose, { Schema } from "mongoose";

const routeSchema = new Schema({
    pickUpStation: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {timestamps: true});

const Route = mongoose.model("Route", routeSchema);

export default Route;