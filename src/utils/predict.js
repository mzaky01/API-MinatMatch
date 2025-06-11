const ort = require("onnxruntime-node");
const { preprocessInput } = require("./preprocess");
const Prediction = require("../models/prediction");
const path = require("path");

const CLASS_NAMES = [
  "Data Scientist",
  "Software Engineer",
  "AI Specialist",
  "Web Developer",
  "Database Admin",
  "Cybersecurity Analyst",
  "Game Developer",
  "Network Engineer",
  "Cloud Engineer",
  "Mobile Developer",
  "DevOps Engineer",
  "System Analyst",
  "UI/UX Designer",
  "QA Engineer",
  "Product Manager",
  "Business Analyst",
  "Technical Writer",
];

let session;
async function loadModel() {
  if (!session) {
    const modelPath = path.join(__dirname, "../models/model.onnx");
    session = await ort.InferenceSession.create(modelPath);
    console.log("ONNX model loaded");
  }
  return session;
}

const predictCareer = async (request, h) => {
  try {
    await loadModel();
    const features = preprocessInput(request.payload);
    const inputTensor = new ort.Tensor("float32", Float32Array.from(features), [1, 80]);
    const feeds = { feature_input: inputTensor };
    const results = await session.run(feeds);
    const output = results[Object.keys(results)[0]].data;
    const predictions = Array.from(output)
      .map((prob, idx) => ({
        career: CLASS_NAMES[idx],
        probability: parseFloat(prob.toFixed(4)),
      }))
      .sort((a, b) => b.probability - a.probability);

    if (request.auth && request.auth.userId) {
      await Prediction.create({
        userId: request.auth.userId,
        name: request.payload.name || "User",
        predictions: predictions.slice(0, 3),
        inputData: request.payload,
      });
    }

    return h
      .response({
        status: "success",
        data: {
          name: request.payload.name || "User",
          predictions: predictions.slice(0, 3),
        },
      })
      .code(200);
  } catch (err) {
    console.error("Prediction error:", err);
    return h
      .response({
        status: "error",
        message: "Failed to make prediction",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      })
      .code(500);
  }
};

module.exports = { predictCareer, loadModel };
