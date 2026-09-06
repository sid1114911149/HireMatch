const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    extractedText: { type: String, default: '' },
    parsedData: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          duration: String,
        },
      ],
      experience: [
        {
          company: String,
          title: String,
          duration: String,
          description: String,
        },
      ],
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
        },
      ],
      certifications: [String],
      totalExperience: { type: Number, default: 0 }, // years
    },
    score: {
      overall: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
    },
    suggestions: [String],
    isAnalyzed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
