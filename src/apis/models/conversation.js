export default (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    'Conversation',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isGroup: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      isChannel: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      participants: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      roomId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    },
  );

  return Conversation;
};
