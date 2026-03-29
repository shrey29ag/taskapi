const Task = require('../models/Task.model');

const PRIORITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };

exports.getTasks = async (req, res, next) => {
  try {
    const {
      status, priority, page = 1, limit = 20,
      sortBy = 'createdAt', order = 'desc', search, tags,
    } = req.query;

    const filter = {};
    if (req.user.role !== 'admin') filter.createdBy = req.user._id;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tags) filter.tags = { $in: tags.split(',').map((t) => t.trim().toLowerCase()) };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean({ virtuals: true });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (req.user.role !== 'admin' && task.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this task.' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      assignedTo,
      createdBy: req.user._id,
    });

    await task.populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task.' });
    }

    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'assignedTo'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    if (!isOwner && !isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task.' });
    }

    task.status = status;
    await task.save();
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const isOwner = task.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task.' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.getTaskStats = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };

    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          review: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ['$dueDate', new Date()] }, { $ne: ['$status', 'done'] }, { $ne: ['$dueDate', null] }] },
                1, 0,
              ],
            },
          },
        },
      },
    ]);

    res.json({ success: true, data: stats[0] || { total: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 } });
  } catch (err) {
    next(err);
  }
};
