/* eslint-disable indent */
import express from 'express';
import loaders from './loaders/index.js';
import Config from './config/index.js';
import { Logger } from './utils/logger.js';
import socketIO from './socket/socket.js';

// eslint-disable-next-line require-jsdoc
async function startServer() {
  const app = express();

  // Start by first loading all the required dependencies before listening for requests...
  await loaders({ app });

  socketIO();

  // Start listening requests...
  app
    .listen(Config.EnvConfig.port, () => {
      Logger.info(`✔ Server is running on port: ${Config.EnvConfig.port}`);
    })
    .on('error', (error) => {
      Logger.error(error.message);
      process.exit(1);
    });
}

startServer();
