class Logger {
  constructor() {
    this.prefix = {
      info: '[INFO]',
      error: '[ERROR]',
      warn: '[WARN]',
      debug: '[DEBUG]'
    };
    
    // Bind methods to preserve 'this' context
    this.info = this.info.bind(this);
    this.error = this.error.bind(this);
    this.warn = this.warn.bind(this);
    this.debug = this.debug.bind(this);
  }

  info(message, ...args) {
    console.log(`${this.prefix.info} ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`${this.prefix.error} ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`${this.prefix.warn} ${message}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${this.prefix.debug} ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
export const { info: logInfo, error: logError, warn: logWarn, debug: logDebug } = logger;