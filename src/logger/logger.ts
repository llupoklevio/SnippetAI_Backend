import pino, { LoggerOptions } from 'pino';

const pinoOptions: LoggerOptions = {
    level: process.env.NODE_ENV === 'development' ?'info' : 'silent',
};

if (process.env.NODE_ENV === 'development') {
    pinoOptions.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    };
}

export const logger = pino(pinoOptions);