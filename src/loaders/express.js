import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import Config from '../config/index.js';
import { errorHandler } from '../middlewares/index.js';
import router from '../apis/routes/index.js';

// eslint-disable-next-line require-jsdoc
export default async ({ app }) => {
  // Verifying server status...
  app.get('/status', (req, res) => res.sendStatus(200).end());
  app.head('/status', (req, res) => res.sendStatus(200).end());

  app.enable('trust proxy');

  // Middleware to secure Express applications by setting various HTTP headers...
  app.use(helmet());

  /**  Middleware sets CORS headers in the HTTP Response,
   * allowing the client-side code to make requests to your API's from other domains. */
  app.use(cors({ origin: '*' }));
  app.use(morgan(Config.EnvConfig.logs.morgan));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // All APIS
  app.use(Config.EnvConfig.api.prefix, router);

  // Error Handling Middleware...
  app.use(errorHandler);
};
