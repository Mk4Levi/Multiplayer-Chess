import { useNavigate, useParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Square } from 'react-chessboard/dist/chessboard/types';
import { Copy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Progress from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import useGame from '@/hooks/useGame';

function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { toast } = useToast();

  const currentUrl = window.location.href;

  const {
    ws,
    game,
    isLoading,
    gameStatus,
    progress,
    isYourTurn,
    orientation,
    alertTitle,
    open,
    showGameInviteLink,
    setGame,
    setIsYourTurn,
    setAlertTitle,
    setOpen,
  } = useGame(gameId as string);

  function makeAMove(move: { from: Square; to: Square; promotion: string }) {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result !== null && result !== undefined) {
        setGame(gameCopy);
      }
      const isCheckmate = gameCopy.isCheckmate();
      const isDraw = gameCopy.isDraw();

      return { move: result, isCheckmate, isDraw };
    } catch (error) {
      return { move: null, isCheckmate: false, isDraw: false };
    }
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    const { move, isCheckmate, isDraw } = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    // illegal move
    if (move === null || move === undefined) return false;

    const makeMovePayload = {
      method: 'makeMove',
      data: { gameId, move },
    };

    ws.current?.send(JSON.stringify(makeMovePayload));

    setIsYourTurn(false);

    if (isCheckmate) {
      setAlertTitle('You Won, Congrats!');
      setOpen(true);

      ws.current?.send(
        JSON.stringify({
          method: 'endGame',
          data: {
            gameId,
            reason: 'Won',
          },
        })
      );
    } else if (isDraw) {
      setAlertTitle("It's a Draw, Try Again!");
      setOpen(true);

      ws.current?.send(
        JSON.stringify({
          method: 'endGame',
          data: {
            gameId,
            reason: 'Draw',
          },
        })
      );
    }

    return true;
  }

  return (
    <>
      <Toaster />
      {isLoading && (
        <div className="h-2/5 flex justify-center items-center">
          <Progress value={progress} className="w-[60%]" />
        </div>
      )}

      {gameStatus === 'gameStarted' && (
        <div className="w-full md:flex md:justify-center">
          <div className="md:w-full lg:w-[46%] ">
            <Chessboard
              position={game.fen()}
              arePiecesDraggable={isYourTurn}
              // eslint-disable-next-line react/jsx-no-bind
              onPieceDrop={onDrop}
              boardOrientation={orientation}
            />
          </div>
        </div>
      )}

      {open === true && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  navigate('/dashboard');
                }}
              >
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showGameInviteLink && (
        <Dialog open={showGameInviteLink}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Game Invite link</DialogTitle>
              <DialogDescription>
                Waiting for Opponent to Join this Game!
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input id="link" defaultValue={currentUrl} readOnly />
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl);
                  toast({
                    title: '🎉 Game Invite Copied!',
                    description:
                      'Ready to play? Challenge your friends to a chess match now!',
                  });
                }}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default Game;
