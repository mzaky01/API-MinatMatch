const Prediction = require("../models/prediction");

const predictCareer = async (request, h) => {
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

  const indices = [];
  while (indices.length < 3) {
    const idx = Math.floor(Math.random() * CLASS_NAMES.length);
    if (!indices.includes(idx)) indices.push(idx);
  }

  let probs = [Math.random(), Math.random(), Math.random()];
  const total = probs.reduce((a, b) => a + b, 0);
  probs = probs.map((p) => parseFloat((p / total).toFixed(4)));

  const predictions = indices.map((idx, i) => ({
    career: CLASS_NAMES[idx],
    probability: probs[i],
  }));

  if (request.auth && request.auth.userId) {
    await Prediction.create({
      userId: request.auth.userId,
      name: request.payload.name || "User",
      predictions,
    });
  }

  return h
    .response({
      status: "success",
      data: { 
        name: request.payload.name || "User",
        predictions },
    })
    .code(200);
};

module.exports = { predictCareer };
