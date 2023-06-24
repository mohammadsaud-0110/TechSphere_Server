const {Configuration, OpenAIApi} = require('openai');
require("dotenv").config();
const express=require("express");
const { InterviewModel } = require('../models/interview.model');
const aiRouter=express.Router();
aiRouter.use(express.json());

const apiKEY = process.env.API_TOKEN;
const configuration = new Configuration({apiKey : apiKEY});
const openai = new OpenAIApi(configuration);

//openai to get questions
aiRouter.post('/getQuestions', (req,res)=>{
    try {
        const userID = req.body.user;
        const response = openai.createCompletion({
            model: 'text-davinci-003',
            prompt: req.body.prompt,
            temperature: 0,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 1024
        })
        response.then(async (data)=>{
            let que = data.data.choices[0].text.split("\n").join("").split("?");
            que.pop();
            let mat = [];
            for(let i=0; i < que.length; i++){
                let row = que[i].split(". ")[1];
                mat.push(row);
            }
            let interviewData = new InterviewModel({
                user : userID,
                communication: [],
                technical: [],
                communicationAVG: 0,
                technicalAVG: 0
            })
            await interviewData.save();
            res.send({questions : mat, interviewID: interviewData._id});
        })
    } 
    catch (error) {
        res.send({message: error.message})    
    }
    
})

//openai text input for que-ans
aiRouter.post('/message', (req,res) => {
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

module.exports={
    aiRouter
}