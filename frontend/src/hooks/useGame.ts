import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess, Move } from 'chess.js';

interface JoinGameResponse {
  method: string;
  status: string;
  data: {
    gameState?: string;
    gameStatus?: string;
    whoseTurn?: string;
    message?: string;
    userId?: string;
    orientation: string;
  };
}

export default function useGame(gameId: string) {
  const [game, setGame] = useState(new Chess());
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState<string | undefined>('');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [progress, setProgress] = useState(13);
  const [isLoading, setIsLoading] = useState(true);
  const [showGameInviteLink, setShowGameInviteLink] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const ws = useRef<null | WebSocket>(null);

  const userId = useRef('');

  const interval = useRef<NodeJS.Timeout>();

  const handleJoinGame = useCallback((payload: JoinGameResponse) => {
    setIsLoading(false);
    if (payload.status === 'success') {
      setGameStatus(payload.data.gameStatus);
      if (payload.data.gameStatus === 'waitingForOpponent') {
        setShowGameInviteLink(true);
      }
      setGame(new Chess(payload.data.gameState));
      setIsYourTurn(payload.data.whoseTurn === payload.data.userId);
      userId.current = payload.data.userId as string;
      if (payload.data.orientation === 'black') {
        setOrientation('black');
      }
    } else {
      clearInterval(interval.current);
      setAlertTitle(payload.data.message as string);
      setOpen(true);
    }
  }, []);

  const handleGameStarted = useCallback((payload: JoinGameResponse) => {
    if (payload.status === 'success') {
      setShowGameInviteLink(false);
      setGameStatus(payload.data.gameStatus);
      setGame(new Chess(payload.data.gameState));
      setIsYourTurn(payload.data.whoseTurn === userId.current);
    } else {
      setAlertTitle(payload.data.message as string);
      setOpen(true);
    }
  }, []);

  const handleOpponentMove = useCallback(
    (payload: { method: string; move: Move; whoseTurn: string }) => {
      const updatedGame = new Chess(payload.move.after);
      setGame(updatedGame);

      if (updatedGame.isCheckmate()) {
        setAlertTitle('Opponent Won, Try Again!');
        setOpen(true);
      } else if (updatedGame.isDraw()) {
        setAlertTitle("It's a Draw, Try Again!");
        setOpen(true);
      }
      setIsYourTurn(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOpponentLeft = useCallback(() => {
    setAlertTitle('Opponent Left the Game!');
    setOpen(true);
  }, []);

  const handleGameClosed = useCallback(() => {
    setAlertTitle('Game Closed! Start a New Game...');
    setOpen(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(95), 500);

    ws.current = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

    ws.current.onerror = (error) => {
      console.error(error);
    };

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      switch (payload.method) {
        case 'gameClosed':
          handleGameClosed();
          break;
        case 'opponentLeft':
          handleOpponentLeft();
          break;
        case 'joinGameResponse':
          handleJoinGame(payload);
          break;
        case 'gameStarted':
          handleGameStarted(payload);
          break;
        case 'opponentMove':
          handleOpponentMove(payload);
          break;
        default:
          console.log('message', event.data);
      }
    };

    ws.current.onopen = () => {
      interval.current = setInterval(() => {
        const pingPayload = {
          method: 'ping',
        };

        ws.current?.send(JSON.stringify(pingPayload));
      }, 300); // 300ms

      setTimeout(() => {
        const joinGamePayload = {
          method: 'joinGame',
          data: { gameId },
        };

        ws.current?.send(JSON.stringify(joinGamePayload));
      }, 1000); // 1 seconds
    };

    ws.current.onclose = () => {
      clearInterval(interval.current);
    };

    const wsCurrent = ws.current;

    return () => {
      clearTimeout(timer);
      wsCurrent.close(1000);
      clearInterval(interval.current);
    };
  }, [
    gameId,
    handleGameStarted,
    handleJoinGame,
    handleOpponentMove,
    handleOpponentLeft,
    handleGameClosed,
  ]);

  return {
    ws,
    game,
    isYourTurn,
    gameStatus,
    orientation,
    progress,
    isLoading,
    showGameInviteLink,
    open,
    alertTitle,
    setGame,
    setIsYourTurn,
    setAlertTitle,
    setOpen,
  };
}
