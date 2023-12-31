import { Logger } from '../../utils/logger.js';
import {
  createGroupService,
  joinGroupLinkService,
  joinGroupService,
  createChannelService,
  fetchInviteLinkService,
  joinChannelService,
  leaveGroupService,
  updateAdminService,
  getGroupService,
  fetchGroupChatService,
  getChannelService,
  getDashboardService,
  fetchChatService,
  unreadChatService,
} from '../services/index.js';

// DASHBOARD
export const dashboard = async (req, res, next) => {
  Logger.info('Dashboard Controller Triggered');
  try {
    const userData = await getDashboardService(req.user);
    Logger.info('userData fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'userData fetched Successfully',
      result: { userData },
    });
  } catch (error) {
    console.log('.........................');
    console.log(error);
    return next(error);
  }
};

// Fetch Chat...
export const fetchChat = async (req, res, next) => {
  Logger.info('Fetch Chat Controller Triggered');
  const { id } = req.user;
  const { conversationId } = req.params;
  const { page, limit } = req.query;

  try {
    const data = await fetchChatService(id, conversationId, page, limit);
    Logger.info('Chat fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Chat fetched Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

// Fetch unRead Chat...
export const unreadChat = async (req, res, next) => {
  Logger.info('UnRead Chat Controller Triggered');
  const { id } = req.user;
  const { receiverId } = req.params;

  try {
    const data = await unreadChatService(id, receiverId);
    Logger.info('UnRead Chat fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'UnRead Chat fetched Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

// GROUP APIs
export const createGroup = async (req, res, next) => {
  Logger.info('Create Group Controller Triggered');
  const { id } = req.user;
  try {
    const data = await createGroupService(id, req.body);
    if (!data) throw new Error('Failed to create a group!');
    Logger.info('Group Created Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group Created Successfully',
      result: data,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchInviteLink = async (req, res, next) => {
  Logger.info('Fetch Invite Link Controller Triggered');
  const { id } = req.user;
  try {
    const data = await fetchInviteLinkService(id, req.params);
    if (!data) throw new Error('Failed to fetch invite link!');
    Logger.info('Link Fetch Successfully');
    return res.status(201).json({
      success: true,
      message: 'Link Fetch Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

export const joinGroupLink = async (req, res, next) => {
  Logger.info('Join Group with Link Controller Triggered');
  const { id } = req.user;
  try {
    const group = await joinGroupLinkService(id, req.params);
    if (!group) throw new Error('Failed to join!');
    Logger.info('Group Joined Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group Joined Successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const joinGroup = async (req, res, next) => {
  Logger.info('Join Group Controller Triggered');
  const { id } = req.user;
  try {
    const group = await joinGroupService(id, req.body);
    if (!group) throw new Error('Failed to join!');
    Logger.info('Group Joined Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group Joined Successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  Logger.info('Leave Group Controller Triggered');
  const { id } = req.user;
  try {
    const group = await leaveGroupService(id, req.body);
    if (!group) throw new Error('Failed to join!');
    Logger.info('Group Leaved Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group Leaved Successfully',
      result: group,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchGroupChat = async (req, res, next) => {
  Logger.info('Fetch Group Chat Controller Triggered');
  const { id } = req.user;
  const { conversationId } = req.params;
  const { page, limit } = req.query;

  try {
    const data = await fetchGroupChatService(id, conversationId, page, limit);
    Logger.info('Chat fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Chat fetched Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getGroups = async (req, res, next) => {
  Logger.info('Get Group Controller Triggered');
  const { id } = req.user;
  try {
    const data = await getGroupService(id);
    Logger.info('Group fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group fetched Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdmin = async (req, res, next) => {
  Logger.info('Create Admin Controller Triggered');
  const { id } = req.user;

  try {
    const data = await updateAdminService(id, req.body);
    Logger.info('Group fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Group Admin Created Successfully',
      result: { data },
    });
  } catch (error) {
    return next(error);
  }
};

// CHANNEL APIs
export const createChannel = async (req, res, next) => {
  Logger.info('Create Channel Controller Triggered');
  const { id } = req.user;
  try {
    const data = await createChannelService(id, req.body);
    if (!data) throw new Error('Failed to create a channel!');
    Logger.info('Channel created Successfully');
    return res.status(201).json({
      success: true,
      message: 'Channel created Successfully',
      result: data,
    });
  } catch (error) {
    return next(error);
  }
};

export const joinChannel = async (req, res, next) => {
  Logger.info('Join Channel Controller Triggered');
  const { id } = req.user;
  try {
    const data = await joinChannelService(id, req.body);
    if (!data) throw new Error('Failed to join a channel!');
    Logger.info('Channel Joined Successfully');
    return res.status(201).json({
      success: true,
      message: 'Channel Joined Successfully',
      result: data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getChannels = async (req, res, next) => {
  Logger.info('Get Channels Controller Triggered');
  try {
    const channels = await getChannelService(req.query);
    Logger.info('Channels fetched Successfully');
    return res.status(201).json({
      success: true,
      message: 'Channels fetched Successfully',
      result: channels,
    });
  } catch (error) {
    return next(error);
  }
};
