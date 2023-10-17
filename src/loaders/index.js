import expressLoader from './express.js';
import { Logger } from '../utils/logger.js';

export default async function ({ app }) {
  await expressLoader({ app });
  Logger.info('✔ Express Loaded');
}
