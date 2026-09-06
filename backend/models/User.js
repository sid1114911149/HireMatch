const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  skills: [{ type: String }],
  education: [
    {
      institution: String,
      degree: String,
      field: String,
      from: Date,
      to: Date,
      current: { type: Boolean, default: false },
      grade: String,
    },
  ],
  experience: [
    {
      company: String,
      title: String,
      location: String,
      from: Date,
      to: Date,
      current: { type: Boolean, default: false },
      description: String,
    },
  ],
  projects: [
    {
      title: String,
      description: String,
      technologies: [String],
      link: String,
    },
  ],
  certifications: [
    {
      name: String,
      issuer: String,
      date: Date,
    },
  ],
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['CANDIDATE', 'RECRUITER', 'ADMIN'],
      default: 'CANDIDATE',
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    profile: { type: profileSchema, default: () => ({}) },
    company: { type: String, default: '' }, // for recruiters
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get profile completion percentage
userSchema.methods.getProfileCompletion = function () {
  let score = 0;
  const p = this.profile;
  if (this.name) score += 10;
  if (this.email) score += 10;
  if (p.phone) score += 10;
  if (p.location) score += 10;
  if (p.bio) score += 10;
  if (p.skills && p.skills.length > 0) score += 15;
  if (p.education && p.education.length > 0) score += 15;
  if (p.experience && p.experience.length > 0) score += 15;
  if (p.projects && p.projects.length > 0) score += 5;
  return score;
};

module.exports = mongoose.model('User', userSchema);
