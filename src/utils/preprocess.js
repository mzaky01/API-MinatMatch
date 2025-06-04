function preprocessInput(data) {
  const features = new Array(80).fill(0);

  // 1. Gender encoding
  features[0] = data.gender === 'Female' ? 1 : 0;

  // 2. Normalisasi
  features[1] = data.age / 30;
  features[2] = data.gpa / 4.0;

  // 3. Domain (one-hot)
  const DOMAINS = [
    'Artificial Intelligence',
    'Data Science',
    'Software Development',
    'Web Development',
    'Cybersecurity'
  ];
  const domainIndex = DOMAINS.indexOf(data.interestedDomain);
  if (domainIndex >= 0) features[3 + domainIndex] = 1;

  // 4. Projects (one-hot)
  const PROJECTS = [
    'Chatbot Development',
    'Data Analytics',
    'E-commerce Website',
    'Full-Stack Web App',
    'Network Security'
  ];
  const projectIndex = PROJECTS.indexOf(data.projects);
  if (projectIndex >= 0) features[8 + projectIndex] = 1;

  // 5. Skills
  const SKILL_LEVELS = ['Weak', 'Average', 'Strong'];
  
  // Handle missing skills
  const getSkillLevel = (skill) => 
    data[skill] ? data[skill] : 'Weak';
  
  // Datascience
  const dsLevel = getSkillLevel('datascience');
  features[13 + SKILL_LEVELS.indexOf(dsLevel)] = 1;
  
  // Database
  const dbLevel = getSkillLevel('database');
  features[16 + SKILL_LEVELS.indexOf(dbLevel)] = 1;
  
  // Programming
  const progLevel = getSkillLevel('programming');
  features[19 + SKILL_LEVELS.indexOf(progLevel)] = 1;

  return features;
}

module.exports = { preprocessInput };