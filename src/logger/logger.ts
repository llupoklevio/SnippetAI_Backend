import pino, { LoggerOptions } from 'pino';

const pinoOptions: LoggerOptions = {
    level: 'info',
};

if (process.env.NODE_ENV !== 'development') {
    pinoOptions.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    };
}

export const logger = pino(pinoOptions);