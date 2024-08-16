import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../../config/redis';

export const createGame = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString() as string;

    const onGoingGameOfPlayer = await redisClient.hGet('userGames', userId);

    if (onGoingGameOfPlayer) {
      await redisClient.EXPIRE(`leftTheGame:${userId}`, 1);
    }

    const gameId = uuidv4();

    await redisClient.hSet(`games:${gameId}`, {
      state: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'waiting',
      whoseTurn: '',
      white: '',
      black: '',
    });

    res.json({ gameId });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
