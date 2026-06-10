import goalService from '../services/goal.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const create = asyncHandler(async (req, res) => {
  const goal = await goalService.create(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: { goal },
  });
});

const getAll = asyncHandler(async (req, res) => {
  const result = await goalService.getAll(req.user.id, req.query);

  res.status(200).json({
    success: true,
    data: result.goals,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
});

const getById = asyncHandler(async (req, res) => {
  const goal = await goalService.getById(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: { goal },
  });
});

const update = asyncHandler(async (req, res) => {
  const result = await goalService.update(req.user.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const remove = asyncHandler(async (req, res) => {
  const result = await goalService.delete(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const toggleMilestone = asyncHandler(async (req, res) => {
  const result = await goalService.toggleMilestone(
    req.user.id,
    req.params.id,
    req.params.milestoneId,
    req.body?.completed
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const complete = asyncHandler(async (req, res) => {
  const result = await goalService.complete(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export { create, getAll, getById, update, remove, toggleMilestone, complete };
