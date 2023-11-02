import expressLoader from './express.js';
import { Logger } from '../utils/logger.js';

// eslint-disable-next-line require-jsdoc
export default async ({ app }) => {
  await expressLoader({ app });
  Logger.info('✔ Express Loaded');
};
