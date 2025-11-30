// Structured logging utility for production-ready applications

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
    [key: string]: any
}

class Logger {
    private isDevelopment: boolean

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development'
    }

    /**
     * Log informational messages
     */
    info(message: string, context?: LogContext) {
        this.log('info', message, context)
    }

    /**
     * Log warning messages
     */
    warn(message: string, context?: LogContext) {
        this.log('warn', message, context)
    }

    /**
     * Log error messages
     */
    error(message: string, error?: Error | unknown, context?: LogContext) {
        const errorContext = error instanceof Error
            ? {
                ...context,
                error: {
                    message: error.message,
                    stack: this.isDevelopment ? error.stack : undefined,
                    name: error.name,
                },
            }
            : context

        this.log('error', message, errorContext)
    }

    /**
     * Log debug messages (only in development)
     */
    debug(message: string, context?: LogContext) {
        if (this.isDevelopment) {
            this.log('debug', message, context)
        }
    }

    /**
     * Log security events (authentication, authorization, rate limiting)
     */
    security(event: string, context?: LogContext) {
        this.log('info', `[SECURITY] ${event}`, {
            ...context,
            category: 'security',
        })
    }

    /**
     * Log API requests
     */
    apiRequest(method: string, path: string, context?: LogContext) {
        if (this.isDevelopment) {
            this.log('debug', `[API] ${method} ${path}`, context)
        }
    }

    /**
     * Log payment/webhook events
     */
    payment(event: string, context?: LogContext) {
        this.log('info', `[PAYMENT] ${event}`, {
            ...context,
            category: 'payment',
        })
    }

    /**
     * Core logging method
     */
    private log(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString()

        // In production, use structured JSON logging for better parsing
        if (!this.isDevelopment) {
            const logEntry = {
                timestamp,
                level,
                message,
                ...context,
            }

            const logMethod = level === 'error' ? console.error :
                level === 'warn' ? console.warn :
                    console.log

            logMethod(JSON.stringify(logEntry))
        } else {
            // In development, use readable format
            const prefix = this.getColoredPrefix(level)
            const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : ''

            const logMethod = level === 'error' ? console.error :
                level === 'warn' ? console.warn :
                    level === 'debug' ? console.debug :
                        console.log

            logMethod(`${prefix} ${message}${contextStr}`)
        }
    }

    /**
     * Get colored prefix for development logs
     */
    private getColoredPrefix(level: LogLevel): string {
        const timestamp = new Date().toLocaleTimeString()

        switch (level) {
            case 'error':
                return `❌ [${timestamp}]`
            case 'warn':
                return `⚠️  [${timestamp}]`
            case 'info':
                return `ℹ️  [${timestamp}]`
            case 'debug':
                return `🐛 [${timestamp}]`
            default:
                return `[${timestamp}]`
        }
    }
}

// Export singleton instance
export const logger = new Logger()

// Convenience exports
export const logInfo = logger.info.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logError = logger.error.bind(logger)
export const logDebug = logger.debug.bind(logger)
export const logSecurity = logger.security.bind(logger)
export const logPayment = logger.payment.bind(logger)
