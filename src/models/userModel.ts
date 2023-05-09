import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  firstName: {
    type: "string",
    required: true,
  },
  lastName: {
    type: "string",
    required: true,
  },
  email: {
    type: "string",
    required: true,
  },
  password: {
    type: "string",
    required: true,
  },
  dateOfBirth: {
    type: "string",
    required: true,
  },
  gender: {
    type: "string",
    required: true,
  },
  isVerified: {
    type: "boolean",
    required: true,
  },
  driverStatus: {
    type: "string",
    required: false,
    enum: ['pending', 'verified', 'rejected', 'not started'],
    default: 'not started'
  },
  roles: {
    type: [],
    required: true,
    default: ["passenger"]
  },
  routeOfOperation: {
    type: [],
    required: false,
  },
  phoneNumber: {
    type: "string",
    required: false,
  },
  accountNumber: {
    type: "string",
    required: false,
  },
  validID: {
   public_id: {
        type: "string",
        required: false,
      },
  },
  photo: {
    public_id: {
        type: "string",
        required: false,
      },
  },
    wallet_balance: {
    type: "number",
    required: false,
    default: 0.00
  }

});

const User = mongoose.model("User", userSchema);

export default User;
