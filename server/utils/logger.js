const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.info;

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const base = { timestamp, level, message };
  return JSON.stringify({ ...base, ...meta });
}

export const logger = {
  debug: (message, meta = {}) => {
    if (LOG_LEVELS.debug >= currentLevel) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
  info: (message, meta = {}) => {
    if (LOG_LEVELS.info >= currentLevel) {
      console.info(formatMessage('info', message, meta));
    }
  },
  warn: (message, meta = {}) => {
    if (LOG_LEVELS.warn >= currentLevel) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  error: (message, meta = {}) => {
    if (LOG_LEVELS.error >= currentLevel) {
      console.error(formatMessage('error', message, meta));
    }
  },
};