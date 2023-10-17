import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;
const myFormat = printf(({ timestamp, level, message }) => {
  // Add ANSI color codes to log level
  let color = '';
  switch (level) {
    case 'error':
      color = '\x1b[31m'; // red
      break;
    case 'warn':
      color = '\x1b[33m'; // yellow
      break;
    case 'info':
      color = '\x1b[32m'; // green
      break;
    case 'debug':
      color = '\x1b[36m'; // cyan
      break;
    default:
      color = '\x1b[0m'; // reset
      break;
  }

  return `${color} [${timestamp}] [${level.toUpperCase()}]: ${message}${'\x1b[0m'}`; // reset color at the end
});

export const Logger = createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), myFormat),
  transports: [new transports.Console()],
});
