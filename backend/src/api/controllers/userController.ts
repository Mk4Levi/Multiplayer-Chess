import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';

export const getGames = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id.toString() as string;

    const user = await UserModel.findById(userId).populate({
      path: 'games',
      options: { sort: { createdAt: -1 }, limit: 3 },
    });

    res.status(200).json({
      status: 'success',
      userId: user?._id,
      games: user?.games,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
