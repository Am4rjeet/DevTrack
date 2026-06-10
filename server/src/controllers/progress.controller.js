import progressService from '../services/progress.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const create = asyncHandler(async (req, res) => {
  const result = await progressService.create(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: result,
  });
});

const getAll = asyncHandler(async (req, res) => {
  const result = await progressService.getAll(req.user.id, req.query);

  res.status(200).json({
    success: true,
    data: result.entries,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
});

const getById = asyncHandler(async (req, res) => {
  const entry = await progressService.getById(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: { entry },
  });
});

const update = asyncHandler(async (req, res) => {
  const entry = await progressService.update(req.user.id, req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: { entry },
  });
});

const remove = asyncHandler(async (req, res) => {
  const result = await progressService.delete(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getSummary = asyncHandler(async (req, res) => {
  const summary = await progressService.getSummary(req.user.id, req.query);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

export { create, getAll, getById, update, remove, getSummary };
