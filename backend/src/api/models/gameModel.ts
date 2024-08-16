import { Schema, model, Document, Types } from 'mongoose';

interface Game extends Document {
  gameId: string;
  gameResult: 'Draw' | 'Won';
  winner: Types.ObjectId | null;
  loser: Types.ObjectId | null;
  gameState: string;
  userIdOfPlayerWithWhiteColor: Types.ObjectId;
  userIdOfPlayerWithBlackColor: Types.ObjectId;
}

const gameSchema = new Schema<Game>({
  gameId: {
    type: String,
    required: true,
    unique: true,
  },
  gameResult: {
    type: String,
    enum: ['Draw', 'Won'],
    required: true,
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  loser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  gameState: {
    type: String,
    required: true,
  },
  userIdOfPlayerWithWhiteColor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userIdOfPlayerWithBlackColor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const GameModel = model<Game>('Game', gameSchema);
