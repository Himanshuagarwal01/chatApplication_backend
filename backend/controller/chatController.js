const AsyncHandler = require("express-async-handler");
const Chat = require('../model/chatModel');
const User = require('../model/userModel');

// routeis useful for retrieving one on one chat 

const chatAcess = AsyncHandler(async (req, resp) => {
    const { userId } = req.body;
    const loginUser = req.user;
    console.log("login", loginUser._id.toString())
    if (!userId) {
        console.log("user id aprams not send with request");
        return resp.status(400)
    }

    var isChat = await Chat.find({
        isGroupChat: 'false',
        $and: [
            {
                users: { $elemMatch: { $eq: loginUser._id.toString() } },
            },
            {
                users: { $elemMatch: { $eq: userId } },
            },
        ],
    }).populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: "name email pic"
    })
    console.log('isChat', isChat)

    if (isChat.length > 0) {
        resp.status(200).send(isChat[0]);
    } else {
        var chatData = {
            isGroupChat: 'false',
            chatName: 'sender',
            users: [req.user._id, userId]
        }
        console.log("try out")
        try {
            console.log("tru in ")
            let createdChat = new Chat(chatData);
            createdChat = await createdChat.save();
            console.log("else", createdChat)
            const FullChat = await Chat.findOne({
                _id: createdChat._id
            }).populate('users', "-password");

            resp.status(200).send(FullChat)
        } catch (error) {
            resp.status(400);
            throw new Error(error.message);
        }
    }
})

const fetchChats = AsyncHandler(async (req, resp) => {
    const loginUser = req.user;
    try {
        const chats = await Chat.find({
            users: { $elemMatch: { $eq: loginUser._id.toString() } }
        }).populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage').sort({ updatedAt: -1 });

        console.log("chats", chats);
        const latestMessage = await User.populate(chats, {
            path: 'latestMessage.sender',
            select: "name email pic"
        })
        if (latestMessage) {
            resp.status(200).send(latestMessage);
        }
    } catch (error) {
        resp.status(400);
        throw new Error(error.message)
    }
})

const createGroupChat = AsyncHandler(async (req, resp) => {
    const loginUser = req.user;
    if (!req.body.users || !req.body.chatName) {
        return resp.status(400).send({ message: "Please Fill all the Fields" })
    }
    var users = req.body.users;
    users = users.replace(/'/g, '"')
    users = JSON.parse(users)
    users.push(loginUser._id.toString());
    console.log('users after', typeof users, users);
    try {
        const chatData = {
            chatName: req.body.chatName,
            users: users,
            isGroupChat: true,
            groupAdmmin: loginUser

        }
        let groupChat = new Chat(chatData);
        groupChat = await groupChat.save();

        const fullGroupChat = await Chat.findOne({
            _id: groupChat._id
        }).populate('users', "-password")
            .populate('groupAdmin', '-password');

        console.log("fullGroupChat", fullGroupChat)
        resp.status(200).send(fullGroupChat);
    } catch (error) {
        resp.status(400);
        throw new Error(error.message)
    }
})

// put update chat name api
const renameGroupName = AsyncHandler(async (req, resp) => {
    // if you didnt set new to true then it will reflect the same name 
    const { _id, chatName } = req.body;

    const updatedGroupName = await Chat.findByIdAndUpdate(
        _id,
        {
            chatName
        }, {
        new: true
    }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (updatedGroupName) {
        resp.status(200).send(updatedGroupName);
    } else {
        resp.status(404).send({
            message: "Group Name not found.",
            result: updatedGroupName,
        });
    }
})


const appToGroup = AsyncHandler(async (req, resp) => {
    const { _id, userId } = req.body;

    const addUser = await Chat.findByIdAndUpdate(
        _id,
        {
            $push: { users: userId }
        }, {
        new: true
    }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (addUser) {
        resp.status(200).send(addUser);
    } else {
        resp.status(400);
        throw new Error("Chat Not Found");
    }
});

const removeFromGroup = AsyncHandler(async (req, resp) => {
    console.log("called")
    const { _id, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        _id,
        {
            $pull: { users: userId }
        }, {
        new: true
    }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (removed) {
        resp.status(200).send(removed);
    } else {
        resp.status(400);
        throw new Error("Chat Not Found");
    }
});

module.exports = {
    chatAcess,
    fetchChats,
    createGroupChat,
    renameGroupName,
    appToGroup,
    removeFromGroup
}