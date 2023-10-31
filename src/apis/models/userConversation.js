export default (sequelize, DataTypes) => {
  const UserConversation = sequelize.define(
    'UserConversation',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Conversation',
          key: 'id',
        },
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    },
  );

  return UserConversation;
};
