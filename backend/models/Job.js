const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 10 },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: 'USD' },
    education: {
      type: String,
      enum: ["High School", "Associate's", "Bachelor's", "Master's", "PhD", "Any"],
      default: 'Any',
    },
    benefits: [String],
    responsibilities: [String],
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
    },
    applicationsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    deadline: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast text search
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ recruiterId: 1 });

module.exports = mongoose.model('Job', jobSchema);
