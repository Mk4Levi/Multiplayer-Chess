import { WebSocketServer } from 'ws';
import sessionParser from '../config/session';
import { Request, Response } from 'express';
import { Duplex } from 'stream';
import {
  handleGameEnd,
  handleJoinGame,
  handleMakeMove,
} from '../api/sockets/gameHandler';
import { redisClient, subscriber } from '../config/redis';
import { deleteUserConnection } from '../store/user';

const wss = new WebSocketServer({ noServer: true });

function parseSession(request: Request) {
  return new Promise((resolve) => {
    sessionParser(request, {} as Response, resolve);
  });
}

function upgradeWebSocket(
  request: any,
  socket: Duplex,
  head: Buffer,
  userId: string
) {
  wss.handleUpgrade(request, socket, head, (client) => {
    wss.emit('connection', client, userId);
  });
}

export async function handleWebSocketUpgrade(
  request: any,
  socket: Duplex,
  head: Buffer
) {
  await parseSession(request);

  const userId = request.session.passport?.user;
  if (!userId) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  upgradeWebSocket(request, socket, head, userId);
}

function heartbeat(socket: any) {
  socket.isAlive = true;
}

export function handleWebSocketConnection(socket: any, userId: string) {
  socket.userId = userId;
  socket.isAlive = true;

  socket.on('message', (message: string) => {
    const payload = JSON.parse(message);

    switch (payload.method) {
      case 'ping':
        heartbeat(socket);
        break;
      case 'joinGame':
        handleJoinGame(socket, userId, payload);
        break;
      case 'makeMove':
        handleMakeMove(socket, userId, payload);
        break;
      case 'endGame':
        handleGameEnd(userId, payload);
        break;
      default:
        console.log(
          `Received ${message.toLocaleString()} from user: ${socket.userId}`
        );
        socket.send('thanks for your message!');
    }
  });

  socket.on('close', async () => {
    if (socket.hasUserLeftTheGame === true) return;

    const onGoingGameOfPlayer = await redisClient.hGet(
      'userGames',
      socket.userId
    );

    if (!onGoingGameOfPlayer) return;

    deleteUserConnection(socket.userId);

    subscriber.unsubscribe(onGoingGameOfPlayer);

    await redisClient.SET(`leftTheGame:${socket.userId}`, socket.userId, {
      EX: 20,
      NX: true,
    });
  });
}

wss.on('connection', handleWebSocketConnection);

const interval = setInterval(function ping() {
  wss.clients.forEach(async function each(socket: any) {
    if (socket.isAlive === false) {
      socket.hasUserLeftTheGame = true;

      deleteUserConnection(socket.userId);

      const onGoingGameOfPlayer = await redisClient.hGet(
        'userGames',
        socket.userId
      );

      if (!onGoingGameOfPlayer) return socket.terminate();

      subscriber.unsubscribe(onGoingGameOfPlayer);

      await redisClient.SET(`leftTheGame:${socket.userId}`, socket.userId, {
        EX: 20,
      });

      return socket.terminate();
    }

    socket.isAlive = false;
  });
}, 3000);

wss.on('close', function close() {
  clearInterval(interval);
});
