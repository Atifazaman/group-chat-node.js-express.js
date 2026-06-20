const Chat = require("../models/chatModel");
const userTable=require("../models/userModel")
const Group = require("../models/groupModel");
const GroupMember = require("../models/groupMemberModel");
const GroupMessage = require("../models/groupMessageModel");
const axios = require("axios");

const { Op } = require("sequelize")


const addMessage = async (req, res) => {
  try {
    const { message, fileUrl, fileType } = req.body;

   if (!message && !fileUrl) {
  return res.status(400).json({
    success: false,
    message: "Message or file is required",
  });
}

   const data = await Chat.create({

  message,

  fileUrl,

  fileType,

  userTableId: req.user.id,

});

    res.status(201).json({
      success: true,
      message: "Message stored successfully",
      data,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const getMessages = async (req, res) => {

  try {

    const messages = await Chat.findAll({

      include:[
        {
          model:userTable,
          attributes:["name"]
        }
      ],

      order:[
        ["createdAt","ASC"]
      ]

    });


    res.status(200).json({
      success:true,
      messages
    });


  } catch(err){

    console.log(err);

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

};

const searchUser = async (req, res) => {
 
  try {
 
    if (req.query.email) {
 
      const user = await userTable.findOne({
        where: {
          email: req.query.email
        },
        attributes: ["id", "name", "email"]
      });
 
      return res.json(user);
    }
 
    if (req.query.query) {
 
      const users = await userTable.findAll({
        where: {
          name: {
            [Op.like]: `%${req.query.query}%`
          },
          id: {
            [Op.ne]: req.user.id
          }
        },
        attributes: ["id", "name", "email"]
      });
 
      return res.json(users);
    }
 
    return res.status(400).json({
      success: false,
      message: "Provide an email or query parameter",
    });
 
  } catch (err) {
 
    console.log(err);
 
    res.status(500).json({
      success: false,
      error: err.message,
    });
 
  }
 
};

const createGroup = async (req, res) => {

  try {

   const { name, users } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Group name required"
      });
    }


    const group = await Group.create({
      name,
      createdBy: req.user.id
    });

console.log("Users received:", users);
await GroupMember.create({
  groupId: group.id,
  userId: req.user.id
});

if (users && users.length > 0) {

  for (const userId of users) {

    await GroupMember.create({
      groupId: group.id,
      userId
    });

  }
}


    res.status(201).json({
      success: true,
      group
    });


  } catch(err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};

const getMyGroups = async (req,res)=>{

  try {

    const groups = await Group.findAll({

      include:[
        {
          model: GroupMember,
          where:{
            userId:req.user.id
          }
        }
      ]

    });


    res.status(200).json(groups);


  } catch(err){

    console.log(err);

    res.status(500).json({
      error:err.message
    });

  }

};

const addMember = async(req,res)=>{

 try{

    const {groupId,userId}=req.body;


    const member = await GroupMember.create({
      groupId,
      userId
    });


    res.status(201).json({
      success:true,
      member
    });


 }catch(err){

    console.log(err);

    res.status(500).json({
      error:err.message
    });

 }

};

const addGroupMessage = async(req,res)=>{

 try{

    const {groupId,message,fileUrl,fileType}=req.body;


   const data = await GroupMessage.create({

  groupId,

  userId:req.user.id,

  message,

  fileUrl,

  fileType

});


    res.status(201).json({
      success:true,
      data
    });


 }catch(err){

    console.log(err);

    res.status(500).json({
      error:err.message
    });

 }

};

const getGroupMessages = async(req,res)=>{

 try{

    const {groupId}=req.params;


       const messages = await GroupMessage.findAll({
      where:{
        groupId
      },

      include:[
        {
    model: userTable,
    as: "sender",
    attributes: ["name"]
  }
      ],

      order:[
        ["createdAt","ASC"]
      ]
    });


    res.status(200).json({
        success:true,
        messages
    });


 }catch(err){

    console.log(err);

    res.status(500).json({
        error:err.message
    });

 }

};

const getUsers = async (req, res) => {
  try {

    const users = await userTable.findAll({
      attributes: ["id", "name", "email"]
    });

    res.status(200).json(users);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }
};



const getSuggestions = async (req, res) => {
  try {

    const { text } = req.body;

    const prompt = `
You are a predictive typing assistant.

Message:
"${text}"

Generate exactly 3 short next-word or next-phrase suggestions.

Return ONLY a JSON array.

Example:
["tomorrow","at 5 PM","in the office"]
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    );

    const result =
      response.data.candidates[0].content.parts[0].text;

    const suggestions = JSON.parse(
      result.replace(/```json|```/g, "").trim()
    );

    res.status(200).json({
      suggestions
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Error generating suggestions"
    });

  }
};


const getSmartReplies = async (req, res) => {
  try {

    const { message } = req.body;

    const prompt = `
You are a chat assistant.

Incoming message:
"${message}"

Generate exactly 3 short reply options.

Return ONLY a JSON array.

Example:
["Sure","I'll be there","Can we reschedule?"]
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    );

    const result =
      response.data.candidates[0].content.parts[0].text;

    const replies = JSON.parse(
      result.replace(/```json|```/g, "").trim()
    );

    res.status(200).json({
      replies
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Error generating smart replies"
    });

  }
};

module.exports = {
  addMessage,getMessages, searchUser,  createGroup,
  getMyGroups,
  addMember,
  addGroupMessage,
  getGroupMessages,
  getUsers,
  getSuggestions,
  getSmartReplies
};