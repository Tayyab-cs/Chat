import { Logger } from '../../utils/logger.js';
import { createGroupService, joinGroupService } from '../services/index.js';

export const createGroup = async (req, res, next) => {
  try {
    const group = await createGroupService(req.body);
    if (!group) throw new Error('Failed to create a group!');
    Logger.info('Group Created Successfully');
    return res.status(201).json({
      success: true,
      message: '==> Group Created Successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const joinGroup = async (req, res, next) => {
  try {
    const group = await joinGroupService(req.body);
    if (!group) throw new Error('Failed to join!');
    Logger.info('Group Joined Successfully');
    return res.status(201).json({
      success: true,
      message: '==> Group Joined Successfully',
    });
  } catch (error) {
    return next(error);
  }
};
