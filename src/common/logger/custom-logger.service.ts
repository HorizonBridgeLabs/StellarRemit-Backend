import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

  setLogLevels(levels: LogLevel[]) {
    this.logLevels = levels;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels.includes(level);
  }

  private formatMessage(message: unknown, context?: LogContext): string {
    const base = typeof message === 'string' ? message : JSON.stringify(message);
    if (!context || Object.keys(context).length === 0) return base;
    return `${base} | context=${JSON.stringify(context)}`;
  }

  log(message: unknown, context?: LogContext) {
    if (!this.shouldLog('log')) return;
    console.log(`[LOG] ${this.formatMessage(message, context)}`);
  }

  error(message: unknown, trace?: string, context?: LogContext) {
    if (!this.shouldLog('error')) return;
    console.error(`[ERROR] ${this.formatMessage(message, context)}`);
    if (trace) console.error(trace);
  }

  warn(message: unknown, context?: LogContext) {
    if (!this.shouldLog('warn')) return;
    console.warn(`[WARN] ${this.formatMessage(message, context)}`);
  }

  debug(message: unknown, context?: LogContext) {
    if (!this.shouldLog('debug')) return;
    console.debug(`[DEBUG] ${this.formatMessage(message, context)}`);
  }

  verbose(message: unknown, context?: LogContext) {
    if (!this.shouldLog('verbose')) return;
    console.log(`[VERBOSE] ${this.formatMessage(message, context)}`);
  }
}
