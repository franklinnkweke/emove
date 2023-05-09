import Transaction from "../models/transactionModel";

export const writeTransactionToDatabase = async (transaction: {}) => {
  const newTransaction = new Transaction(transaction);
  return newTransaction
    .save()
    .then((data:any) => {
      return data;
    })
    .catch((err:any) => {
      console.log("Error: ", err);
      return false;
    });
};
