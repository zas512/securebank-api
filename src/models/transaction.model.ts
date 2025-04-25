import mongoose, { type Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  accountId: mongoose.Types.ObjectId;
  amount: number;
  balance: number;
  description: string;
  category: string;
  type: "credit" | "debit" | "transfer";
  reference?: string;
  date: Date;
  fromAccountId?: mongoose.Types.ObjectId;
  toAccountId?: mongoose.Types.ObjectId;
}

const transactionSchema = new Schema<ITransaction>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    balance: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["credit", "debit", "transfer"],
      required: true
    },
    reference: {
      type: String
    },
    fromAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    toAccountId: { type: Schema.Types.ObjectId, ref: "Account" },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
