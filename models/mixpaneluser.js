'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MixPanelUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MixPanelUser.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    mix_panel_user_device_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'MixPanelUser',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return MixPanelUser;
};