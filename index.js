const express = require("express");
const cors = require('cors');
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.route");
const { authenticate } = require("./middleware/authenticate");
const bodyParser = require("body-parser");
const {Configuration, OpenAIApi} = require('openai');
require("dotenv").config();


const apiKEY = process.env.API_TOKEN;
const configuration = new Configuration({apiKey : apiKEY});
const openai = new OpenAIApi(configuration);

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

//openai to get questions
app.post('/getQuestions', (req,res)=>{
    const response = openai.createCompletion({
        model: 'text-davinci-003',
        prompt: req.body.prompt,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1024
    })
    response.then((data)=>{
        res.send({ message : data.data.choices[0].text });
    })
})

//openai text input for que-ans
app.post('/message', (req,res) => {
    const response = openai.createCompletion({
        model: 'text-davinci-003',
        prompt: req.body.prompt,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1024
    })
    response.then((data)=>{
        res.send({ message : data.data.choices[0].text });
    })
});



app.listen(process.env.PORT, async()=>{
    try {
        await connection;
        console.log("DB Connected");
        console.log("Server port :",process.env.PORT);
    } catch (error) {
        console.log("Error :",error.message);
    }
})