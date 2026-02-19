import "reflect-metadata"

import dotenv from 'dotenv';
dotenv.config();

import express from "express"
import swaggerUi from 'swagger-ui-express';

import snippetsRoute from "./routes/snippet.js"
import authRoute from "./routes/auth.js"
import {getSwaggerDoc} from "./swagger/swaggerRegistry.js";

import "./feature/index.js"

const app = express()

/** Per leggere il req.body **/
app.use(express.json())

/** Swagger attraverso la libreria Zod **/
const swaggerDocument = getSwaggerDoc()
if(process.env.NODE_ENV !== "production")
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/** Routes **/
app.use("/snippets", snippetsRoute)
app.use("/auth", authRoute)

/** Middleware **/

export default app