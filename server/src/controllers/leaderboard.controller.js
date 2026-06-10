import leaderboardService from '../services/leaderboard.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const getLeaderboard = asyncHandler(async (req, res) => {
  const period = req.query.period || 'weekly';
  const data = await leaderboardService.get(period);
  res.status(200).json({ success: true, data });
});

const getMyRank = asyncHandler(async (req, res) => {
  const period = req.query.period || 'weekly';
  const data = await leaderboardService.getUserRank(req.user.id, period);
  res.status(200).json({ success: true, data });
});

const recompute = asyncHandler(async (req, res) => {
  const period = req.query.period;
  const data = period
    ? await leaderboardService.compute(period)
    : await leaderboardService.computeAll();

  res.status(200).json({
    success: true,
    data: { message: 'Leaderboard recomputed', result: data },
  });
});

export { getLeaderboard, getMyRank, recompute };
