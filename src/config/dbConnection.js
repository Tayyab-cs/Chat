import { DataTypes, Sequelize } from 'sequelize';
import { Logger } from '../utils/logger.js';
import { DBConfig } from './dbConfig.js';
import UserModel from '../apis/models/user.js';
import MessageModel from '../apis/models/message.js';
import ConversationModel from '../apis/models/conversation.js';
import UserConversationModel from '../apis/models/userConversation.js';

const { username, password, database, host, dialect } = DBConfig.development;

// Connect to the DB...
const sequelize = new Sequelize({
  username,
  host,
  dialect,
  password,
  database,
  logging: false,
});

// Calling the Model Functions...
const User = UserModel(sequelize, DataTypes);
const Conversation = ConversationModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const UserConversation = UserConversationModel(sequelize, DataTypes);

// User (1->M) Message
User.hasMany(Message, {
  as: 'sentMessages',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'senderId', allowNull: true },
});
Message.belongsTo(User, {
  as: 'sender',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'senderId', allowNull: true },
});

User.hasMany(Message, {
  as: 'receivedMessages',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'receiverId', allowNull: true },
});
Message.belongsTo(User, {
  as: 'receiver',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'receiverId', allowNull: true },
});

// User M<->M Conversation through UserConversation
User.belongsToMany(Conversation, {
  as: 'conversations',
  through: UserConversation,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'userId', allowNull: true },
});
Conversation.belongsToMany(User, {
  as: 'users',
  through: UserConversation,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'conversationId', allowNull: true },
});

// User 1->M UserConversation
User.hasMany(UserConversation, {
  as: 'userConversations',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'userId', allowNull: true },
});
UserConversation.belongsTo(User, {
  as: 'users',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'userId', allowNull: true },
});

// Conversation (1->M) UserConversation
Conversation.hasMany(UserConversation, {
  as: 'userConversations',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'conversationId', allowNull: true },
});
UserConversation.belongsTo(Conversation, {
  as: 'conversations',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'conversationId', allowNull: true },
});

// Conversation (1->M) Message
Conversation.hasMany(Message, {
  as: 'messages',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'conversationId', allowNull: true },
});
Message.belongsTo(Conversation, {
  as: 'conversations',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  foreignKey: { name: 'conversationId', allowNull: true },
});

(async () => {
  try {
    await sequelize.sync({ alter: true, force: false });
    Logger.info('✔ Database synchronized successfully');
  } catch (error) {
    Logger.error(error);
    Logger.error('❌ Error synchronizing the database:');
  }
})();

const models = sequelize.models;

export { sequelize, models };
