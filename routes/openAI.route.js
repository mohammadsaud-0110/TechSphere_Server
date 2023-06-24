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
    try {
        let interviewID = req.body.interviewID;
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
            let feedback = data.data.choices[0].text.split("\n");
            let score = feedback[2].split(", ");
            let communicationSkill = +score[0].split(": ")[1].split("/")[0];
            let techicalKnowledge = +score[1].split(": ")[1].split("/")[0];
            let ans = feedback[4].split(": ")[1];

            let intData = await InterviewModel.findById(interviewID);
            
            intData.communication.push(communicationSkill);
            intData.technical.push(techicalKnowledge);
            
            await InterviewModel.findByIdAndUpdate({ "_id": interviewID }, intData);
            
            res.send({ communicationSkill, techicalKnowledge, ans });
        })
    } 
    catch (error) {
        res.send({message: error.message})    
    }
    
});

aiRouter.get('/getAverage/:interviewID', async(req,res) => {
    try {
        let interviewID = req.params.interviewID;
        let intData = await InterviewModel.findById(interviewID);
        // res.send(intData)
        let comm = intData.communication;
        let tech = intData.technical;
        let sumCom = 0, sumTech = 0;
        for(let i=0; i<comm.length && i<tech.length; i++){
            sumCom += +comm[i];
            sumTech += +tech[i];
        }
        sumCom = sumCom / comm.length;
        sumTech = sumTech / tech.length;
        intData.communicationAVG = sumCom;
        intData.technicalAVG = sumTech;
        await InterviewModel.findByIdAndUpdate({ "_id": interviewID }, intData);
        let result = await InterviewModel.find({ _id: interviewID}).populate('user','name');
        res.send({result})
    } 
    catch (error) {
        res.send({message: "Error occured", error: error.message});
    }
})

module.exports={
    aiRouter
}