import "reflect-metadata"

import dotenv from 'dotenv';
dotenv.config();

import express from "express"
import swaggerUi from 'swagger-ui-express';

import snippetsRoute from "./routes/snippet.js"
import {getSwaggerDoc} from "./swagger/swaggerRegistry.js";

import "./feature/index.js"

const app = express()

/** Per leggere il req.body **/
app.use(express.json())

/** Swagger attraverso la libreria Zod **/
const swaggerDocument = getSwaggerDoc()
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/** Routes **/
app.use("/snippets", snippetsRoute)

/** Middleware **/

export default app