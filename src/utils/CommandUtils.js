const {
  DOWNLOAD_ROBOT_COMMAND,
  SEPARATOR,
  EXECUTE_ROBOT_COMMAND,
  ROBOTS_DIRECTORY,
  UPDATE_OUTPUT_DIRECTORY_COMMAND,
  OPEN_DIRETORY_COMMAND,
  DELETE_ROBOT_COMMAND,
} = require("./constants");

function prepareDownloadRobotCommand(robotId, robotURL, robotFileName) {
  return (
    DOWNLOAD_ROBOT_COMMAND +
    SEPARATOR +
    robotId +
    SEPARATOR +
    robotURL +
    SEPARATOR +
    robotFileName
  );
}

function prepareExecuteRobotCommand(robotId) {
  //EXECUTE_ROBOT_COMMAND(SEPARATOR) robotId;
  return EXECUTE_ROBOT_COMMAND+ SEPARATOR+ROBOTS_DIRECTORY+"/"+robotId+"/"+SEPARATOR+robotId;

  
}

function prepareUpdateRobotOutputFolderCommand(robotId,newPath){
  return UPDATE_OUTPUT_DIRECTORY_COMMAND+SEPARATOR+robotId+SEPARATOR+newPath;
}


function getCommandType(command) {
  return command.split(SEPARATOR)[0];
}

function getRobotPath(roboName,robotId){
    return ROBOTS_DIRECTORY+"/"+robotId+"/"+roboName;
}

function getRobotIdFromCommand(command){
    return command.split(SEPARATOR)[2];
}

function prepareOpenDirectoryCommand(directoryPath){
  return OPEN_DIRETORY_COMMAND+SEPARATOR+directoryPath;
}

function prepareDeleteRobotCommand(robotId){
return DELETE_ROBOT_COMMAND+SEPARATOR+robotId;
}

module.exports = {
  prepareDownloadRobotCommand,
  prepareExecuteRobotCommand,
  getCommandType,
  getRobotPath,
  getRobotIdFromCommand,
  prepareUpdateRobotOutputFolderCommand,
  prepareOpenDirectoryCommand,
  prepareDeleteRobotCommand
};
