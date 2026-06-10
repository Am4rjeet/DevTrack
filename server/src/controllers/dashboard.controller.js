import dashboardService from '../services/dashboard.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboard(req.user.id);
  res.status(200).json({ success: true, data });
});

export { getDashboard };
