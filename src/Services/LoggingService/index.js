import log4js from 'log4js';

export default function getLogger({
  category = 'default',
  level = 'debug',
} = {}) {
  const logger = log4js.getLogger(category || 'default');
  logger.level = level || 'debug';
  return logger;
}
