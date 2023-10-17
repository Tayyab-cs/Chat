import { DataTypes, Sequelize } from 'sequelize';
import { Logger } from '../utils/logger.js';
import { DBConfig } from './dbConfig.js';
import UserModel from '../apis/models/user.js';
import MessageModel from '../apis/models/message.js';
import ConversationModel from '../apis/models/conversation.js';

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

User.belongsToMany(Conversation, { through: 'UserConversation' });
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
Message.belongsTo(User, {
  as: 'receiver',
  foreignKey: 'receiverId',
});
Message.belongsTo(Conversation);

Conversation.belongsToMany(User, { through: 'UserConversation' });
Conversation.hasOne(Message);

(async () => {
  try {
    await sequelize.sync({ alter: false, force: false });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.log(error);
    console.error('Error synchronizing the database:');
  }
})();

const models = sequelize.models;

export { sequelize, models };
