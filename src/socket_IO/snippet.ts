import {DefaultEventsMap, Server, Socket} from "socket.io";
import jwt from "jsonwebtoken";
import {ErrorResponse} from "../middleware/error/ErrorResponse.js";

export const socketSnippetIO = (io:  Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    const snippetIO = io.of("snippet")

        snippetIO.use((socket, next) => {
            const token = socket.handshake.headers.authorization?.split(" ")[1]

            if (!token) return next(new ErrorResponse("JWT_ERROR", "BusinessLogic", "No token provided for socket"));

            socket.data.user = jwt.verify(token, process.env.SECRET_JWT!)
            next()

        })

        snippetIO.on("connection", (socket: Socket) => {
            console.log("connesso:", socket.id)

            socket.on("join", (room) => {
                socket.join(`snippet:${room}`)
                console.log("joined")
            })

            socket.on("disconnect", () => {
                socket.disconnect()
                console.log("disconnesso:", socket.id)
            })

        })

    return snippetIO

}