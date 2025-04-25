import mongoose, { type Document, Schema } from "mongoose";

export interface IAccount extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  number: string;
  balance: number;
  currency: string;
  limit?: number;
  status?: boolean;
  createdAt?: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
    },
    type: {
      type: String,
      required: true
    },
    number: {
      type: String,
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
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", accountSchema);
