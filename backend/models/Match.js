const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    scores: {
      overall: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      similarity: { type: Number, default: 0 },
    },
    matchedSkills: [String],
    missingSkills: [String],
    preferredSkillsMatched: [String],
    recommendation: {
      type: String,
      enum: ['Excellent Match', 'Strong Match', 'Good Match', 'Partial Match', 'Weak Match'],
      default: 'Partial Match',
    },
    skillGap: [
      {
        skill: String,
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        reason: String,
        learningDirection: String,
      },
    ],
    mlModelUsed: { type: String, default: 'random_forest' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

matchSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
matchSchema.index({ candidateId: 1, 'scores.overall': -1 });

module.exports = mongoose.model('Match', matchSchema);
