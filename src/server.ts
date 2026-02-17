import app from "./app.js"
import dotenv from 'dotenv';

dotenv.config();

const main = () => {
    try{

        app.listen(process.env.PORT_SERVER)
        console.log("Server is running on port: " + process.env.PORT_SERVER)

    }catch(err){

        console.error(err)

    }
}

main()
