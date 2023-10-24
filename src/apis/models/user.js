export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isAvatarSet: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      avatarImage: {
        type: DataTypes.STRING,
        default: '',
      },
      socketId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    },
  );

  return User;
};
