const tf = require("@tensorflow/tfjs-node");
const { preprocessInput } = require("./preprocess");
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

let model;

async function loadModel() {
  try {
    const modelPath = path.join(__dirname, "../models/tfjs_model/model.json");
    model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log("Model loaded successfully");
    return model;
  } catch (err) {
    console.error("Model loading error:", err);
    throw err;
  }
}

async function predictCareer(request, h) {
  try {
    if (!model) {
      await loadModel();
    }

    const requiredFields = [
      "gender",
      "age",
      "gpa",
      "interestedDomain",
      "projects",
      "datascience",
      "database",
      "programming",
    ];

    for (const field of requiredFields) {
      if (request.payload[field] === undefined || request.payload[field] === null) {
        return h
          .response({
            status: "fail",
            message: `Field '${field}' harus diisi`,
          })
          .code(400);
      }
    }

    // 1. Preprocessing
    const features = preprocessInput(request.payload);
    const inputTensor = tf.tensor2d([features], [1, 80]);

    // 2. Prediction
    const outputTensor = model.predict(inputTensor);
    const predictions = Array.from(await outputTensor.data());

    // 3. Clean up tensors
    inputTensor.dispose();
    outputTensor.dispose();

    // 4. Format results
    const results = predictions
      .map((probability, index) => ({
        career: CLASS_NAMES[index],
        probability: parseFloat(probability.toFixed(4)),
      }))
      .sort((a, b) => b.probability - a.probability);

    return h
      .response({
        status: "success",
        data: {
          predictions: results.slice(0, 3),
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
}

module.exports = { loadModel, predictCareer };
