const { Sequelize, DataTypes } = require('sequelize');

// Initialize SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const Course = sequelize.define('course', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nfqLevel: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    institute: {
        type: DataTypes.STRING,
        allowNull: false
    },
    art_link: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = { sequelize, Course };