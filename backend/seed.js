require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');

const connectDB = require('./config/db');

const seedJobs = [
  {
    title: 'Senior Full Stack Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'We are looking for an experienced Full Stack Engineer to join our growing team. You will work on building scalable web applications using modern technologies.',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'REST API'],
    preferredSkills: ['Docker', 'AWS', 'Redis', 'GraphQL'],
    experienceMin: 3,
    experienceMax: 7,
    salaryMin: 120000,
    salaryMax: 180000,
    education: "Bachelor's",
    responsibilities: ['Build and maintain web applications', 'Lead technical discussions', 'Code reviews'],
  },
  {
    title: 'Machine Learning Engineer',
    company: 'AI Innovations Ltd.',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Join our ML team to build intelligent systems. You will design and implement ML pipelines, train models, and deploy them to production.',
    requiredSkills: ['Python', 'Machine Learning', 'Scikit-learn', 'TensorFlow', 'Pandas'],
    preferredSkills: ['PyTorch', 'Docker', 'Kubernetes', 'AWS'],
    experienceMin: 2,
    experienceMax: 6,
    salaryMin: 130000,
    salaryMax: 200000,
    education: "Master's",
    responsibilities: ['Design ML models', 'Build data pipelines', 'Deploy models to production'],
  },
  {
    title: 'React Frontend Developer',
    company: 'Startup Hub',
    location: 'Remote',
    type: 'Remote',
    description: 'We need a talented React developer to build beautiful, responsive user interfaces for our SaaS platform.',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
    preferredSkills: ['Next.js', 'Tailwind', 'GraphQL', 'Redux'],
    experienceMin: 1,
    experienceMax: 4,
    salaryMin: 80000,
    salaryMax: 120000,
    education: "Bachelor's",
    responsibilities: ['Build React components', 'Implement designs', 'Performance optimization'],
  },
  {
    title: 'Backend Node.js Developer',
    company: 'CloudScale Co.',
    location: 'Austin, TX',
    type: 'Full-time',
    description: 'Build robust, scalable REST APIs and microservices. Work with cloud infrastructure and ensure high availability.',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API', 'Docker'],
    preferredSkills: ['Kubernetes', 'AWS', 'Redis', 'PostgreSQL'],
    experienceMin: 2,
    experienceMax: 5,
    salaryMin: 100000,
    salaryMax: 150000,
    education: "Bachelor's",
    responsibilities: ['Build REST APIs', 'Database design', 'Cloud deployment'],
  },
  {
    title: 'DevOps Engineer',
    company: 'InfraFirst',
    location: 'Seattle, WA',
    type: 'Full-time',
    description: 'Design and maintain CI/CD pipelines, manage cloud infrastructure, ensure security and scalability.',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    preferredSkills: ['Terraform', 'Ansible', 'Python', 'Bash'],
    experienceMin: 3,
    experienceMax: 8,
    salaryMin: 120000,
    salaryMax: 170000,
    education: "Bachelor's",
    responsibilities: ['Manage infrastructure', 'CI/CD pipelines', 'Security hardening'],
  },
  {
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Boston, MA',
    type: 'Full-time',
    description: 'Analyze large datasets, build predictive models, and provide actionable insights to business teams.',
    requiredSkills: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'Data Analytics'],
    preferredSkills: ['Deep Learning', 'TensorFlow', 'Tableau', 'Spark'],
    experienceMin: 2,
    experienceMax: 6,
    salaryMin: 110000,
    salaryMax: 160000,
    education: "Master's",
    responsibilities: ['Data analysis', 'Model building', 'Reporting insights'],
  },
  {
    title: 'Software Engineer Intern',
    company: 'TechStartup XYZ',
    location: 'Remote',
    type: 'Internship',
    description: 'Great opportunity for students to gain real-world experience building web applications in a fast-paced environment.',
    requiredSkills: ['JavaScript', 'HTML', 'CSS', 'Git'],
    preferredSkills: ['React', 'Node.js', 'Python'],
    experienceMin: 0,
    experienceMax: 1,
    salaryMin: 30000,
    salaryMax: 50000,
    education: "Any",
    responsibilities: ['Build features', 'Write tests', 'Participate in code reviews'],
  },
  {
    title: 'Python Django Developer',
    company: 'WebDev Agency',
    location: 'Chicago, IL',
    type: 'Contract',
    description: 'Looking for an experienced Django developer to build and maintain web applications for our clients.',
    requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Git'],
    preferredSkills: ['Docker', 'AWS', 'Redis', 'Celery'],
    experienceMin: 2,
    experienceMax: 6,
    salaryMin: 90000,
    salaryMax: 140000,
    education: "Bachelor's",
    responsibilities: ['Build Django apps', 'API development', 'Database management'],
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Create recruiter user
    let recruiter = await User.findOne({ email: 'recruiter@hirematch.com' });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'John Recruiter',
        email: 'recruiter@hirematch.com',
        password: 'password123',
        role: 'RECRUITER',
        company: 'HireMatch Demo Corp',
      });
    }

    // Create admin user
    let admin = await User.findOne({ email: 'admin@hirematch.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@hirematch.com',
        password: 'admin123',
        role: 'ADMIN',
      });
    }

    // Create candidate user
    let candidate = await User.findOne({ email: 'candidate@hirematch.com' });
    if (!candidate) {
      candidate = await User.create({
        name: 'Jane Candidate',
        email: 'candidate@hirematch.com',
        password: 'password123',
        role: 'CANDIDATE',
        profile: {
          bio: 'Full Stack Developer with 3 years of experience',
          location: 'San Francisco, CA',
          skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Python'],
          education: [{
            institution: 'State University',
            degree: "Bachelor's",
            field: 'Computer Science',
            from: new Date('2018-08-01'),
            to: new Date('2022-05-01'),
          }],
        },
      });
    }

    // Seed jobs
    await Job.deleteMany({ recruiterId: recruiter._id });
    const jobsWithRecruiter = seedJobs.map(j => ({ ...j, recruiterId: recruiter._id }));
    await Job.insertMany(jobsWithRecruiter);

    console.log('✅ Seed data created successfully');
    console.log('📧 Recruiter: recruiter@hirematch.com / password123');
    console.log('📧 Admin: admin@hirematch.com / admin123');
    console.log('📧 Candidate: candidate@hirematch.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
