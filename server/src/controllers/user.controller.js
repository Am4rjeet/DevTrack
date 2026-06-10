import userService from '../services/user.service.js';
import asyncHandler from '../utils/asyncHandler.js';

const getPublicProfile = asyncHandler(async (req, res) => {
  const data = await userService.getPublicProfile(req.params.username);
  res.status(200).json({ success: true, data });
});

export { getPublicProfile };
