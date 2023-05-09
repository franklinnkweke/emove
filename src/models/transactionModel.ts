import mongoose from "mongoose";

const transactionsSchema:any = new mongoose.Schema({
  status: {
    type: "string",
    enum: ["success", "failed"],
    required: true,
  },
  transactionType: {
    type: "string",
    enum: ["credit", "debit"],
    required: true,
  },
  userId: {
    type: "string",
    required: true,
  },
  referenceId: {
    type: "string",
    required: false,
  },
  amount: {
    type: "number",
    required: true,
  },
  processed: { 
    type: Boolean, 
    required: false, 
    },
   tripId: {
    type: "string",
    required: false,
    },
})

transactionsSchema.set("timestamps", true);

const Transaction = mongoose.model("Transaction", transactionsSchema);

export default Transaction;
