export default (sequelize, DataTypes) => {
  const UserConversation = sequelize.define(
    'UserConversation',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    },
  );

  return UserConversation;
};
