/**
 * Simple logging service
 * In production, replace with a proper logging library like Winston
 */
class Logger {
  constructor(context) {
    this.context = context;
  }

  _formatMessage(level, message) {
    return `[${new Date().toISOString()}] [${level}] [${
      this.context
    }] ${message}`;
  }

  _formatError(error) {
    if (!error) return "";
    return error.stack || error.message || error.toString();
  }

  info(message, meta = {}) {
    console.log(this._formatMessage("INFO", message), meta);
  }

  warn(message, meta = {}) {
    console.warn(this._formatMessage("WARN", message), meta);
  }

  error(message, error = null, meta = {}) {
    console.error(
      this._formatMessage("ERROR", message),
      error ? this._formatError(error) : "",
      meta
    );
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this._formatMessage("DEBUG", message), meta);
    }
  }
}

// Create logger factory
const createLogger = (context) => new Logger(context);

module.exports = createLogger;
