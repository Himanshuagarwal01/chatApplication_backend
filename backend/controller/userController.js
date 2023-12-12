const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const generateToken = require('../config/generateToken');

const register = asyncHandler(async (req, resp) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        resp.status(400);
        throw new Error('Please enter all fields');
    };
    const userExists = await User.findOne({ email });
    if (userExists) {
        resp.status(400);
        throw new Error('User Already Exists');
    }
    // let user = await User.find({});
    let user = new User({ name: name, email: email, password: password });
    user = await user.save();
    if (user) {
        resp.status(201).send(user
        )
    } else {
        resp.status(400);
        throw new Error('Failed to create user')
    }

});

// post /user/login

const login = asyncHandler(async (req, resp) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        resp.status(200).send({
            ...user._doc,
            token: generateToken(user._id)
        })
    } else {
        resp.status(400);
        throw new Error('Invalid Email and Password');
    }
})

// GET Search user?search

const searchUser = asyncHandler(async (req, resp) => {
    const loginUser = req.user;
    const data = req.query.search ? req.query.search : { $ne: req.user._id }
    const regex = new RegExp(data, "i");
    const userData = await User.find({ name: regex });
    const loginUsersData = userData.filter(user => user._id.toString() === loginUser._id.toString());
    console.log("userData", loginUsersData);

    if (loginUsersData) {
        resp.status(200).send(loginUsersData)
    } else {
        resp.status(400)
        throw new Error('No Data Found')
    }
})

module.exports = {
    register,
    login,
    searchUser
}