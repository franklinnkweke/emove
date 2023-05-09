import mongoose from "mongoose";

interface photoData{
    public_id: String,
    url: String
}

const driverSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    routeOfOperation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "routes",
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    driverStatus: {
        type: String,
        required: true,
        default: "pending"
    },
    photo: {
        type: String,
        required: true
    },
    validId: {
        type: String,
        required: true
    }
});

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;