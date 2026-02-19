import pino, { LoggerOptions } from 'pino';

const pinoOptions: LoggerOptions = {
    level: 'info',
};

if (process.env.NODE_ENV !== 'production') {
    pinoOptions.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    };
}

export const logger = pino(pinoOptions);