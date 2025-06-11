const Prediction = require("../models/prediction");

const predictionHistoryHandler = async (request, h) => {
  try {
    if (!request.auth || !request.auth.userId) {
      return h.response({ status: "fail", message: "Unauthorized" }).code(401);
    }
    const history = await Prediction.find({ userId: request.auth.userId }).sort({ createdAt: -1 });
    return h.response({ status: "success", data: history }).code(200);
  } catch (err) {
    console.error("Error in predictionHistoryHandler:", err);
    return h.response({ status: "error", message: "Server error" }).code(500);
  }
}

const deletePredictionHistoryHandler = async (request, h) => {
  try {
    if (!request.auth || !request.auth.userId) {
      return h.response({ status: "fail", message: "Unauthorized" }).code(401);
    }
    await Prediction.deleteMany({ userId: request.auth.userId });
    return h.response({ status: "success", message: "Prediction history deleted successfully" }).code(200);
  } catch (err) {
    console.error("Error in deletePredictionHistoryHandler:", err);
    return h.response({ status: "error", message: "Server error" }).code(500);
  }
};

const deletePredictionByIdHandler = async (request, h) => {
  try {
    if (!request.auth || !request.auth.userId) {
      return h.response({ status: "fail", message: "Unauthorized" }).code(401);
    }
    const { id } = request.params;
    const deleted = await Prediction.findOneAndDelete({ _id: id, userId: request.auth.userId });
    if (!deleted) {
      return h.response({ status: "fail", message: "Data not found or not owned by you" }).code(404);
    }
    return h.response({ status: "success", message: "Prediction deleted successfully" }).code(200);
  } catch (err) {
    console.error("Error in deletePredictionByIdHandler:", err);
    return h.response({ status: "error", message: "Server error" }).code(500);
  }
};

module.exports = { predictionHistoryHandler, deletePredictionHistoryHandler, deletePredictionByIdHandler };