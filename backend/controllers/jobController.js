const Job = require('../models/Job');

// @route  GET /api/jobs
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search, location, type, experienceMin, experienceMax,
      salaryMin, salaryMax, skills, page = 1, limit = 10, sort = 'createdAt',
    } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (experienceMin) query.experienceMin = { $gte: Number(experienceMin) };
    if (experienceMax) query.experienceMax = { $lte: Number(experienceMax) };
    if (salaryMin) query.salaryMin = { $gte: Number(salaryMin) };
    if (salaryMax) query.salaryMax = { $lte: Number(salaryMax) };
    if (skills) {
      const skillsArr = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArr.map(s => new RegExp(s, 'i')) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj = sort === 'salary' ? { salaryMax: -1 } : { createdAt: -1 };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiterId', 'name company avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/jobs/:id
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name company avatar');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    job.views += 1;
    await job.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/jobs  (RECRUITER)
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, recruiterId: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/jobs/:id
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/jobs/recruiter/my-jobs
exports.getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};
