const chalk = require("chalk");

function jarvisLog(message) {
  console.log(chalk.cyan(`JARVIS: ${message}`));
}

function errorLog(message) {
  console.log(chalk.red(`ERROR: ${message}`));
}

function infoLog(message) {
  console.log(chalk.yellow(`INFO: ${message}`));
}

module.exports = { jarvisLog, errorLog, infoLog };