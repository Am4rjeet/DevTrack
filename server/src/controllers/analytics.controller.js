import analyticsService from '../services/analytics.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.user.id, req.query);
  res.status(200).json({ success: true, data });
});

const getHoursChart = asyncHandler(async (req, res) => {
  const data = await analyticsService.getHoursChart(req.user.id, req.query);
  res.status(200).json({ success: true, data });
});

const getXPChart = asyncHandler(async (req, res) => {
  const data = await analyticsService.getXPChart(req.user.id, req.query);
  res.status(200).json({ success: true, data });
});

const getDSABreakdown = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDSABreakdown(req.user.id, req.query);
  res.status(200).json({ success: true, data });
});

const getHeatmap = asyncHandler(async (req, res) => {
  const data = await analyticsService.getHeatmap(req.user.id, req.query);
  res.status(200).json({ success: true, data });
});

export { getOverview, getHoursChart, getXPChart, getDSABreakdown, getHeatmap };
