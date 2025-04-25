import mongoose, { type Document, Schema } from "mongoose";

export interface IAccount extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  number: string;
  balance: number;
  currency: string;
  limit?: number;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0
    },
    currency: {
      type: String,
      required: true,
      default: "USD"
    },
    limit: {
      type: Number
    }
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", accountSchema);
