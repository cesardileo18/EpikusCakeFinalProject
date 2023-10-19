import { Schema, model } from "mongoose";

export const RecoverTokensMongoose = model(
  "recover-tokens",
  new Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    expire: { type: String, required: true },
  }),
);
