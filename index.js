const express = require("express");
const cors = require('cors');
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.route");
const { authenticate } = require("./middleware/authenticate");
const bodyParser = require("body-parser");
const { aiRouter } = require("./routes/openAI.route");
require("dotenv").config();



const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req,res)=>{
    res.status(200).send({"msg":"Server up and running"});
})

app.use("/user", userRouter)

app.get("/note", authenticate , (req,res)=>{
    res.send("To check if middleware is working")
})

app.use('/interview', authenticate, aiRouter)



app.listen(process.env.PORT, async()=>{
    try {
        await connection;
        console.log("DB Connected");
        console.log("Server port :",process.env.PORT);
    } catch (error) {
        console.log("Error :",error.message);
    }
})