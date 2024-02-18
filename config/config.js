const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  "development": {
    "username": process.env.LOCAL_MYSQL_DB_USERNAME,
    "password": process.env.LOCAL_MYSQL_DB_PASSWORD,
    "database": process.env.LOCAL_MYSQL_DB_NAME,
    "port": process.env.LOCAL_MYSQL_DB_PORT,
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.PROD_DB_USERNAME,
    "password": process.env.PROD_DB_PASSWORD,
    "database": process.env.PROD_DB_NAME,
    "host": process.env.PROD_DB_HOST,
    "dialect": "mysql",

    "port": 3306,
    "ssl": true,
    "dialectOptions": {
        "ssl": {
          "require": true,
          "rejectUnauthorized": false
        }
    },
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  }
}
