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

// User Association...
User.belongsTo(UserConversation, {
  foreignKey: 'userId',
});
User.hasMany(Message, {
  as: 'sentMessages',
  foreignKey: 'senderId',
});
User.hasMany(Message, {
  as: 'receivedMessages',
  foreignKey: 'receiverId',
});
Message.belongsTo(User, {
  as: 'sender',
  foreignKey: 'senderId',
});

// Message Association...
Message.belongsTo(User, {
  as: 'receiver',
  foreignKey: { name: 'receiverId', allowNull: true },
});
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

// Conversation Association...
Conversation.belongsTo(UserConversation, { foreignKey: 'conversationId' });
Conversation.hasMany(Message, { foreignKey: 'conversationId' });

// UserConversation Association...
UserConversation.hasMany(User, { foreignKey: 'userId' });
UserConversation.hasMany(Conversation, { foreignKey: 'conversationId' });

(async () => {
  try {
    await sequelize.sync({ alter: false, force: false });
    Logger.info('✔ Database synchronized successfully');
  } catch (error) {
    Logger.error(error);
    Logger.error('❌ Error synchronizing the database:');
  }
})();

const models = sequelize.models;

export { sequelize, models };
