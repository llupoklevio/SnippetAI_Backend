import "reflect-metadata"

import dotenv from 'dotenv';
dotenv.config();

import express from "express"
import swaggerUi from 'swagger-ui-express';
import cors from "cors"

import snippetsRoute from "./routes/snippet.js"
import authRoute from "./routes/auth.js"
import {getSwaggerDoc} from "./swagger/swaggerRegistry.js";

import "./feature/index.js"
import {
    CapturedErrorMiddleware,
    defaultErrorMiddleware,
    PostgresErrorMiddleware
} from "./middleware/error/errorMiddleware.js";

import {logger} from "./logger/logger.js";
import { pinoHttp } from 'pino-http';
import {setupModelAI} from "./AI/model.js";
import {limiter} from "./RateLimiting/rate.js";

const app = express()

/** logger **/
app.use(pinoHttp({
    logger
}));

/** Per leggere il req.body **/
app.use(express.json())

/** Cors
 *
 * Non si ha ancora un host per fe
 *
 * */
app.use(cors({
    origin: "*"
}));

/** AI */
void setupModelAI();

/** rateLimit */
app.use(limiter)

/** Swagger attraverso la libreria Zod **/
const swaggerDocument = getSwaggerDoc()
// if(process.env.NODE_ENV !== "production")
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/** Routes **/
app.use("/snippets", snippetsRoute)
app.use("/auth", authRoute)

/** Middleware **/
app.use([PostgresErrorMiddleware,CapturedErrorMiddleware,defaultErrorMiddleware])

export default app