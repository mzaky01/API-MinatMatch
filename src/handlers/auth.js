const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
require("../db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const registerHandler = async (request, h) => {
  try {
    const { name, email, password } = request.payload;

    if (!name || !email || !password) {
      return h
        .response({
          status: "fail",
          message: "Registration failed. Please fill in all fields.",
        })
        .code(400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return h
        .response({
          status: "fail",
          message: "Invalid email format.",
        })
        .code(400);
    }

    if (password.length < 6) {
      return h
        .response({
          status: "fail",
          message: "Password must be at least 6 characters.",
        })
        .code(400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return h
        .response({
          status: "fail",
          message: "Registration failed. Email is already registered.",
        })
        .code(400);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return h
      .response({
        status: "success",
        message: "Registration successful.",
      })
      .code(201);
  } catch (error) {
    console.error("Error in registerHandler:", error);
    return h
      .response({
        status: "error",
        message: "Server error occurred.",
      })
      .code(500);
  }
};

const loginHandler = async (request, h) => {
  try {
    const { email, password } = request.payload;

    if (!email || !password) {
      return h
        .response({
          status: "fail",
          message: "Login failed. Please provide email and password.",
        })
        .code(400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return h
        .response({
          status: "fail",
          message: "Incorrect email or password.",
        })
        .code(401);
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return h
        .response({
          status: "fail",
          message: "Incorrect email or password.",
        })
        .code(401);
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    return h
      .response({
        status: "success",
        data: {
          token,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error in loginHandler:", error);
    return h
      .response({
        status: "error",
        message: "Server error occurred.",
      })
      .code(500);
  }
};

module.exports = {
  registerHandler,
  loginHandler,
};
