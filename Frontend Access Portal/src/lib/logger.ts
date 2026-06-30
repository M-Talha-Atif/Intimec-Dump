/**
 * Structured logger utility.
 * In production builds, debug/info/log calls are silenced.
 * Warnings and errors always output.
 */

const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const noop = (..._args: unknown[]) => {};

export const logger = {
  debug: isProd ? noop : console.debug.bind(console),
  info: isProd ? noop : console.info.bind(console),
  log: isProd ? noop : console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  
  /** Log with a named context prefix */
  withContext: (context: string) => ({
    debug: isProd ? noop : (...args: unknown[]) => console.debug(`[${context}]`, ...args),
    info: isProd ? noop : (...args: unknown[]) => console.info(`[${context}]`, ...args),
    log: isProd ? noop : (...args: unknown[]) => console.log(`[${context}]`, ...args),
    warn: (...args: unknown[]) => console.warn(`[${context}]`, ...args),
    error: (...args: unknown[]) => console.error(`[${context}]`, ...args),
  }),
};
