import { RedisClientType, createClient } from 'redis';
import {
  REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  NODE_ENV,
} from './config';

import { handleGameEnd } from '../api/sockets/gameHandler';

function getUserIdFromKey(key: string): string | null {
  const match = key.match(/^leftTheGame:(.*)$/);
  return match ? match[1] : null;
}

let redisClient: RedisClientType;
let publisher: RedisClientType;
let subscriber: RedisClientType;

(async (): Promise<any> => {
  try {
    if (NODE_ENV === 'production') {
      redisClient = createClient({
        url: `rediss://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
      });
    } else {
      redisClient = createClient({
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD,
        socket: {
          host: REDIS_HOST,
          port: Number(REDIS_PORT),
        },
      });
    }

    redisClient.on('error', console.error);
    redisClient.on('ready', () => {
      console.log('Redis is Ready to use');
    });
    redisClient.on('connect', () => {
      console.log('redis is trying to connect to server');
    });
    redisClient.on('end', () => {
      console.log('connection has been closed');
    });
    redisClient.on('reconnecting', () => {
      console.log('Redis is trying to re-connect to server');
    });

    publisher = redisClient;

    await redisClient.connect();

    subscriber = redisClient.duplicate();

    subscriber.on('error', console.error);
    subscriber.on('ready', () => {
      console.log('Redis is Ready to use');
    });
    subscriber.on('connect', () => {
      console.log('redis is trying to connect to server');
    });
    subscriber.on('end', () => {
      console.log('connection has been closed');
    });
    subscriber.on('reconnecting', () => {
      console.log('Redis is trying to re-connect to server');
    });

    await subscriber.connect();

    if (NODE_ENV === 'development') {
      redisClient.CONFIG_SET('notify-keyspace-events', 'Ex');
    }

    subscriber.subscribe('__keyevent@0__:expired', async (message) => {
      const expiredKey = message;

      // Acquire lock before performing action
      const lockKey = `lock:${expiredKey}`;
      const lockValue = `${process.pid}:${Date.now()}`;
      const lockAcquired = await redisClient.set(lockKey, lockValue, {
        NX: true,
        EX: 10,
      }); // 10 seconds lock expiration

      if (lockAcquired === 'OK') {
        try {
          const playerLeftUserId = getUserIdFromKey(message) as string;
          let remainingPlayerUserId;
          const onGoingGameOfPlayer = (await redisClient.hGet(
            'userGames',
            playerLeftUserId
          )) as string;

          const players = await redisClient.sMembers(
            `games:${onGoingGameOfPlayer}:users`
          );

          if (players[0] === playerLeftUserId) {
            remainingPlayerUserId = players[1];
          } else {
            remainingPlayerUserId = players[0];
          }

          const opponentLeftPayload = {
            method: 'opponentLeft',
            remainingPlayerUserId: remainingPlayerUserId,
            playerLeftUserId: playerLeftUserId,
          };

          publisher.publish(
            `games:${onGoingGameOfPlayer}`,
            JSON.stringify(opponentLeftPayload)
          );

          handleGameEnd(playerLeftUserId, {
            method: 'endGame',
            data: { gameId: onGoingGameOfPlayer, reason: 'userLeftTheGame' },
          });
        } finally {
          // Release the lock
          await redisClient.DEL(lockKey);
        }
      }
    });
    return { redisClient, publisher, subscriber };
  } catch (error) {
    console.error('Error :', error);
  }
})();

export { redisClient, publisher, subscriber };
