const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/users");
require("./db");
require("dotenv").config();
const Boom = require("@hapi/boom");

const JWT_SECRET = process.env.JWT_SECRET;

const registerHandler = async (request, h) => {
  try {
    const { name, email, password } = request.payload;

    if (!name || !email || !password) {
      return h
        .response({
          status: "fail",
          message: "Gagal registrasi. Mohon isi semua field",
        })
        .code(400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return h
        .response({
          status: "fail",
          message: "Format email tidak valid",
        })
        .code(400);
    }

    if (password.length < 6) {
      return h
        .response({
          status: "fail",
          message: "Password minimal 6 karakter",
        })
        .code(400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return h
        .response({
          status: "fail",
          message: "Gagal registrasi. Email sudah terdaftar",
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
        message: "Registrasi berhasil",
      })
      .code(201);
  } catch (error) {
    console.error("Error in registerHandler:", error);
    return h
      .response({
        status: "error",
        message: "Terjadi kesalahan pada server",
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
          message: "Gagal login. Mohon isi email dan password",
        })
        .code(400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return h
        .response({
          status: "fail",
          message: "Email atau password salah",
        })
        .code(401);
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return h
        .response({
          status: "fail",
          message: "Email atau password salah",
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
        message: "Terjadi kesalahan pada server",
      })
      .code(500);
  }
};

const authMiddleware = (request, h) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw Boom.unauthorized("Akses ditolak. Format token tidak sesuai");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.auth = decoded;
    return h.continue;
  } catch {
    throw Boom.unauthorized("Token tidak valid");
  }
};

const changePasswordHandler = async (request, h) => {
  try {
    const userId = request.auth.userId;
    const { oldPassword, newPassword } = request.payload;

    if (!oldPassword || !newPassword) {
      return h.response({
        status: "fail",
        message: "Mohon isi password lama dan password baru",
      }).code(400);
    }

    if (newPassword.length < 6) {
      return h.response({
        status: "fail",
        message: "Password baru minimal 6 karakter",
      }).code(400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return h.response({
        status: "fail",
        message: "User tidak ditemukan",
      }).code(404);
    }

    const isValidOldPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!isValidOldPassword) {
      return h.response({
        status: "fail",
        message: "Password lama salah",
      }).code(401);
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    return h.response({
      status: "success",
      message: "Password berhasil diubah",
    }).code(200);
  } catch (error) {
    console.error("Error in changePasswordHandler:", error);
    return h.response({
      status: "error",
      message: "Terjadi kesalahan pada server",
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
        message: "User tidak ditemukan",
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
      message: "Terjadi kesalahan pada server",
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
        message: "Nama dan email wajib diisi",
      }).code(400);
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return h.response({
        status: "fail",
        message: "Format email tidak valid",
      }).code(400);
    }

    const emailUsed = await User.findOne({ email, _id: { $ne: userId } });
    if (emailUsed) {
      return h.response({
        status: "fail",
        message: "Email sudah digunakan user lain",
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
        message: "User tidak ditemukan",
      }).code(404);
    }

    let profilePicUrl = null;
    if (user.profilePic && user.profilePic.data) {
      profilePicUrl = `data:${user.profilePic.contentType};base64,${user.profilePic.data.toString("base64")}`;
    }

    return h.response({
      status: "success",
      message: "Profil berhasil diubah",
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
      message: "Terjadi kesalahan pada server",
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
        message: "User tidak ditemukan",
      }).code(404);
    }

    const Prediction = require("./models/prediction");
    await Prediction.deleteMany({ userId });
    return h.response({
      status: "success",
      message: "Akun berhasil dihapus beserta semua datanya",
    }).code(200);
  } catch (error) {
    console.error("Error in deleteAccountHandler:", error);
    return h.response({
      status: "error",
      message: "Terjadi kesalahan pada server",
    }).code(500);
  }
};

module.exports = {
  registerHandler,
  loginHandler,
  authMiddleware,
  changePasswordHandler,
  getProfileHandler,
  editProfileHandler,
  deleteAccountHandler,
};
