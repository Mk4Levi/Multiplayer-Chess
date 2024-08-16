import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Separator from '@/components/ui/separator';
import { createNewGame } from '@/lib/api';
import useUserGames from '@/hooks/useUserGames';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [createGameError, setCreateGameError] = useState<null | string>(null);
  const { games, userId } = useUserGames();
  const navigate = useNavigate();

  async function createGame() {
    setIsLoading(true);

    try {
      const { gameId } = await createNewGame();

      if (gameId) {
        navigate(`/games/${gameId}`);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.status === 401) {
          navigate('/login');
        }
      }

      setCreateGameError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="w-full h-svh grid grid-rows-[1fr_1px_1fr] md:grid-cols-[1fr_1px_1fr] gap-2">
      <section className=" h-full w-full grid ">
        <div className="h-full w-full  flex flex-col items-center ">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl lg:text-4xl">GAME</CardTitle>
          </CardHeader>
          <CardContent className="my-14 lg:w-1/2 ">
            {createGameError && (
              <div className="text-red-500">{createGameError}</div>
            )}
            <Button
              type="submit"
              className="w-full text-base"
              disabled={!!isLoading}
              onClick={() => createGame()}
            >
              Create Game
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
            </Button>
          </CardContent>
        </div>
      </section>
      <Separator orientation="vertical" className="bg-slate-700" />
      <section className=" h-full">
        <div className="h-full w-full  flex flex-col items-center ">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl lg:text-4xl">HISTORY</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <Table>
              <TableCaption>A list of your previous games.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead className="text-center">Winner</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game, index) => {
                  let winner;
                  if (userId === game.winner) {
                    winner = 'You';
                  } else if (userId === game.loser) {
                    winner = 'Opponent';
                  } else {
                    winner = 'No One';
                  }
                  return (
                    <TableRow key={game.gameId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="text-center">{winner}</TableCell>
                      <TableCell className="text-center">
                        {game.gameResult}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
