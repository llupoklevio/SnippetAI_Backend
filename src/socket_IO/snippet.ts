import {DefaultEventsMap, Server, Socket} from "socket.io";

export const socketSnippetIO = (io:  Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {

    const snippetIO = io.of("snippet")

        snippetIO.on("connection", (socket: Socket) => {
            console.log("connesso:", socket.id)

            socket.on("join", (room) => {
                socket.join(`snippet:${room}`)
                console.log("joined")
            })

            socket.on("disconnect", () => {
                console.log("disconnesso:", socket.id)
            })
        })


    return snippetIO

}