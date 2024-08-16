import { Schema, model, Document, Types } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
  games: Types.ObjectId[];
}

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  games: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Game',
    },
  ],
});

export const UserModel = model<User>('User', userSchema);
