export default (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    },
  );

  return Message;
};
