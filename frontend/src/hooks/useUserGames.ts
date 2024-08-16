import { useEffect, useState } from 'react';
import { getUserGames } from '@/lib/api';

interface Game {
  gameId: string;
  gameResult: 'Draw' | 'Won';
  winner: string | null;
  loser: string | null;
  gameState: string;
  userIdOfPlayerWithWhiteColor: string;
  userIdOfPlayerWithBlackColor: string;
}

export default function useUserGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [userId, setUserId] = useState();

  useEffect(() => {
    async function fetchUserGames() {
      const data = await getUserGames();
      setUserId(data.userId);
      setGames(data.games);
    }

    fetchUserGames();
  }, []);

  return {
    games,
    userId,
  };
}
