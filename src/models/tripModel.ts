import mongoose, { Schema } from "mongoose";

const tripSchema = new Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "routes",
      required: true,
    },
    trxn_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transactions",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
