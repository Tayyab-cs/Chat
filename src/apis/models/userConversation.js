export default (sequelize, DataTypes) => {
  const userConversation = sequelize.define(
    'userConversation',
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
  return userConversation;
};
