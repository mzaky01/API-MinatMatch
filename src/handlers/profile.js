const User = require("../models/users");
const bcrypt = require("bcryptjs");

const changePasswordHandler = async (request, h) => {
  try {
    const userId = request.auth.userId;
    const { oldPassword, newPassword } = request.payload;

    if (!oldPassword || !newPassword) {
      return h.response({
        status: "fail",
        message: "Please provide old and new password.",
      }).code(400);
    }

    if (newPassword.length < 6) {
      return h.response({
        status: "fail",
        message: "New password must be at least 6 characters.",
      }).code(400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return h.response({
        status: "fail",
        message: "User not found.",
      }).code(404);
    }

    const isValidOldPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!isValidOldPassword) {
      return h.response({
        status: "fail",
        message: "Old password is incorrect.",
      }).code(401);
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    return h.response({
      status: "success",
      message: "Password changed successfully.",
    }).code(200);
  } catch (error) {
    console.error("Error in changePasswordHandler:", error);
    return h.response({
      status: "error",
      message: "Server error occurred.",
    }).code(500);
  }
};

const getProfileHandler = async (request, h) => {
  try {
    const userId = request.auth.userId;
    const user = await User.findById(userId);
    if (!user) {
      return h.response({
        status: "fail",
        message: "User not found.",
      }).code(404);
    }
    let profilePic = null;
    if (user.profilePic && user.profilePic.data) {
      profilePic = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString("base64")}`;
    }
    return h.response({
      status: "success",
      data: {
        name: user.name,
        email: user.email,
        profilePic,
      },
    }).code(200);
  } catch (error) {
    console.error("Error in getProfileHandler:", error);
    return h.response({
      status: "error",
      message: "Server error occurred.",
    }).code(500);
  }
};

const editProfileHandler = async (request, h) => {
  try {
    const userId = request.auth.userId;
    const { name, email } = request.payload;
    let profilePic = request.payload.profilePic;

    if (!name || !email) {
      return h.response({
        status: "fail",
        message: "Name and email are required.",
      }).code(400);
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return h.response({
        status: "fail",
        message: "Invalid email format.",
      }).code(400);
    }

    const emailUsed = await User.findOne({ email, _id: { $ne: userId } });
    if (emailUsed) {
      return h.response({
        status: "fail",
        message: "Email is already used by another user.",
      }).code(400);
    }

    const update = { name, email };
    if (profilePic && profilePic._data) {
      update.profilePic = {
        data: profilePic._data || (await profilePic.toBuffer?.()),
        contentType: profilePic.hapi.headers["content-type"],
      };
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return h.response({
        status: "fail",
        message: "User not found.",
      }).code(404);
    }

    let profilePicUrl = null;
    if (user.profilePic && user.profilePic.data) {
      profilePicUrl = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString("base64")}`;
    }

    return h.response({
      status: "success",
      message: "Profile updated successfully.",
      data: {
        name: user.name,
        email: user.email,
        profilePic: profilePicUrl,
      },
    }).code(200);
  } catch (error) {
    console.error("Error in editProfileHandler:", error);
    return h.response({
      status: "error",
      message: "Server error occurred.",
    }).code(500);
  }
};

const deleteAccountHandler = async (request, h) => {
  try {
    const userId = request.auth.userId;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return h.response({
        status: "fail",
        message: "User not found.",
      }).code(404);
    }

    const Prediction = require("../models/prediction");
    await Prediction.deleteMany({ userId });
    return h.response({
      status: "success",
      message: "Account and all related data deleted successfully.",
    }).code(200);
  } catch (error) {
    console.error("Error in deleteAccountHandler:", error);
    return h.response({
      status: "error",
      message: "Server error occurred.",
    }).code(500);
  }
};

module.exports = {
  changePasswordHandler,
  getProfileHandler,
  editProfileHandler,
  deleteAccountHandler,
};