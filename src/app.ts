import dotenv from 'dotenv';
dotenv.config();

import express from "express"
const app = express()

/** Per leggere il req.body **/
app.use(express.json())

/** Swagger attraverso la libreria Zod **/

/** Routes **/

/** Middleware **/

export default app