const { spawn } = require("child_process");
const {
  DOWNLOAD_ROBOT_COMMAND,
  ROBOTS_DIRECTORY,
  SEPARATOR,
  EXECUTE_ROBOT_COMMAND,
  WORKING_DIRECTORY,
  UPDATE_OUTPUT_DIRECTORY_COMMAND,
  OPEN_DIRETORY_COMMAND,
  FETCH_ROBOTS_COMMAND,
  FETCH_ROBOTS_COMMAND_REPLY,
  DELETE_ROBOT_COMMAND,
  EXECUTE_ROBOT_COMMAND_REPLY,
  DOWNLOAD_ROBOT_COMMAND_REPLY,
  FETCH_REMOTE_ROBOTS_COMMAND,
  FETCH_REMOTE_ROBOTS_COMMAND_REPLY,
} = require("./constants");
const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { cwd } = require("process");
const yaml = require("js-yaml");
const {
  addRunRecord,
  getRunRecords,
  addNewRobotRecord,
  Robot,
  getRobotById,
  updateRobotOutputPath,
  updateRunRecord,
  getRunDataById,
  getAllRobots,
  deleteRobot,
} = require("./db");
const {
  prepareDownloadRobotCommand,
  getCommandType,
  getRobotPath,
  getRobotIdFromCommand,
} = require("./CommandUtils");
const { fetchAvailableRobots, uploadZipFileAndCreateEntry } = require("./supabase_utils");

const executeCommand = (command, onExecutionFinished) => {
  const whichCommand = getCommandType(command);

  if (whichCommand == DOWNLOAD_ROBOT_COMMAND) {
    download_robot(command, onExecutionFinished);
    //check if the robot already exists in the robot directory    // if exists - verify checksum //if matches - notify already present
    //else: download from server into the robots directory
  } else if (whichCommand == UPDATE_OUTPUT_DIRECTORY_COMMAND) {
    update_robot_output_path(command);
  } else if (whichCommand == DELETE_ROBOT_COMMAND) {
    deleteRobot(command.split(SEPARATOR)[1]);
  } else if (whichCommand == FETCH_REMOTE_ROBOTS_COMMAND) {
    let p = fetchAvailableRobots();
    p.then((data) => {
      
      console.log({...data,event:FETCH_REMOTE_ROBOTS_COMMAND_REPLY});
      onExecutionFinished({...data,event:FETCH_REMOTE_ROBOTS_COMMAND_REPLY});
    });
  } else if (whichCommand == FETCH_ROBOTS_COMMAND) {
    getAllRobots((err, d) => {
      if (err) {
        let result = { error: err, event: FETCH_ROBOTS_COMMAND_REPLY };
        console.log(result);
        onExecutionFinished(result);
      } else {
        let result = {
          error: false,
          data: d,
          event: FETCH_ROBOTS_COMMAND_REPLY,
        };
        console.log(result);
        onExecutionFinished(result);
      }
    });
  } else if (whichCommand == EXECUTE_ROBOT_COMMAND) {
    console.log(command);
    const robotId = getRobotIdFromCommand(command);

    getRobotById(robotId, (error, data) => {
      if (error) {
        console.log(data);
      } else {
        console.log(data);
        roboDirectory = data.directory_name;

        addRunRecord(
          { roboId: robotId, outputDirectory: data.output_directory_path },
          (err, data) => {
            if (err) {
              console.log(data);
            } else {
              let run_id = data;
              console.log("RUN ID is " + run_id);
              execute_robot(
                run_id,
                getRobotPath(roboDirectory, robotId),
                (err, dt) => {
                  console.log("errrrrrr is " + err);
                  onExecutionFinished({
                    error: err,
                    data: dt,
                    event: EXECUTE_ROBOT_COMMAND_REPLY,
                  });
                }
              );
            }
          }
        );
      }
    });

    // console.log(robotId);

    //for file system commands
    // rcc run --task "Image Search"
  }
  // await child.waitForExit();
};

function update_robot_output_path(command) {
  splits = command.split(SEPARATOR);
  robotId = splits[1];
  newPath = splits[2];

  updateRobotOutputPath(robotId, newPath);
}

function download_robot(command, onExecutionFinished) {
  // command needs to contain the url for robot.zip
  // command format = "DOWNLOAD_ROBOT HTTP://ABC.COM/ROBOT1.ZIP"

  splits = command.split(SEPARATOR);

  const robotId = splits[1];
  const fileUrl = splits[2];
  const fileName = splits[3];

  const fullPath = ROBOTS_DIRECTORY + "/" + robotId;
  console.log("Full download path is " + fullPath);

  // Check if the directory exists, and if not, create it
  if (!fs.existsSync(fullPath)) {
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log("Folder structure created successfully.");
    } catch (error) {
      console.error("Error creating folder structure:", error);
      e = "Error creating folder structure:" + error;
      onExecutionFinished({ success: false, message: e });
      return;
    }
  } else {
    console.log("Folder structure already exists.");
  }

  axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  })
    .then((response) => {
      newFilePath = fullPath + "/" + fileName;
      const writer = fs.createWriteStream(newFilePath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        console.log("File downloaded successfully.");
        unzip_robot(newFilePath, fullPath, (result) => {
          console.log(robotId + "-" + fileName + "-" + fullPath);

          let robot = new Robot();
          robot.id = robotId;
          robot.robot_url = fileUrl;

          robot.directory_name = fileName.split(".zip")[0];
          robot.name = robot.directory_name;
          robot.output_directory_path = "output";

          addNewRobotRecord(robot);
          // addNewRobotRecord(robotId,robotName,fullPath,);

          if (result.success) {
            onExecutionFinished({
              success: true,
              message: "Robot Downloaded.",
              event: DOWNLOAD_ROBOT_COMMAND_REPLY,
            });
          } else {
            onExecutionFinished(result);
          }
        });
      });

      writer.on("error", (err) => {
        console.error("Error writing file:", err);
      });
    })
    .catch((error) => {
      console.error("Error downloading the file:", error);
      e = "Error downloading the file:" + error;
      onExecutionFinished({ success: false, message: e });
    });
}
function executeCommands(
  commands,
  index = 0,
  cwd = process.cwd(),
  onAllCommandsExecuted
) {
  if (index >= commands.length) {
    console.log("All commands executed.");

    if (onAllCommandsExecuted != undefined) {
      onAllCommandsExecuted(false);
    }

    return;
  }

  const command = commands[index];
  const args = command.match(/("[^"]+"|[^"\s]+)/g); // Split by spaces, keeping quoted parts intact

  console.log(cwd);
  console.log(args[0]);
  console.log(args.slice(1));
  console.log(cwd);

  const child = spawn(args[0], args.slice(1), { cwd });

  child.stdout.on("data", (data) => {
    console.log(`${commands[index]} stdout: ${data.toString()}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`${commands[index]} stderr: ${data.toString()}`);
  });

  child.on("close", (code) => {
    console.log(`${commands[index]} exited with code ${code}`);
    if (code !== 0) {
      // If the command exited with a non-zero code, throw an error
      onAllCommandsExecuted(
        true,
        `${commands[index]} failed with code ${code}`
      );
      return;
      // throw new Error(`${commands[index]} failed with code ${code}`);
    }

    executeCommands(commands, index + 1, cwd, onAllCommandsExecuted);
  });
}

function execute_robot(
  run_id,
  directoryPath,
  onExecutionFinished,
  command = "ls"
) {
  // cm = "cd "+directoryPath
  try {
    // Read the YAML file
    console.log("Directory path is" + directoryPath);
    yamlPath = directoryPath + "/robot.yaml";

    console.log("YAML path is" + yamlPath);

    // const roboFolder = path.join(__dirname, directoryPath);
    // const fullPath = path.join(__dirname, yamlPath);
    // const fullPath = ROBOTS_DIRECTORY+yamlPath;
    // console.log("Full path is"+fullPath);

    const fileContents = fs.readFileSync(yamlPath, "utf8");
    // Parse YAML to JavaScript object
    const data = yaml.load(fileContents);

    // Access the tasks
    const tasks = data.tasks;
    taskName = Object.keys(tasks)[0];
    var rccExecutionCommand;
    //insert execution record in DB
    if (process.platform == "darwin") {
      rccExecutionCommand =
        WORKING_DIRECTORY + '/rcc run --task "' + taskName + '"';
    } else {
      rccExecutionCommand =
        WORKING_DIRECTORY + '/rcc.exe run --task "' + taskName + '"';
    }

    const commands = [rccExecutionCommand];

    executeCommands(commands, 0, directoryPath, (error, message) => {
      console.log("=========================================================");
      if (error) {
        updateRunRecord(run_id, false);
        onExecutionFinished(true, message);
      } else {
        updateRunRecord(run_id, true);
        zip_robot_output(directoryPath, directoryPath,run_id);

        copyOutputToNewDirectory(run_id, directoryPath);
        onExecutionFinished(false, "Robot executed successfully");
      }
    });
  } catch (error) {
    updateRunRecord(run_id, false);
    console.error("Error reading or parsing the YAML file:", error);
    onExecutionFinished(
      false,
      "Error reading or parsing the YAML file:" + error
    );
  }
}

function copyOutputToNewDirectory(run_id, directoryPath) {
  getRunDataById(run_id, (err, data) => {
    const sourceFilePath = directoryPath + "/output/log.html"; // Set the source file path
    const destinationDirectory = data.output_directory + "/" + run_id + "/";

    // Construct the destination file path by combining the destination directory and the file name
    const destinationFilePath = path.join(destinationDirectory, "log.html");

    // Check if the source file exists
    if (fs.existsSync(sourceFilePath)) {
      // Create the destination directory if it doesn't exist
      if (!fs.existsSync(destinationDirectory)) {
        fs.mkdirSync(destinationDirectory, { recursive: true });
      }

      // Copy the file from the source to the destination
      fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
        if (err) {
          console.error(`Error copying file: ${err}`);
        } else {
          console.log(`File copied successfully to ${destinationFilePath}`);
        }
      });
    } else {
      console.error(`Source file not found: ${sourceFilePath}`);
    }
  });
}

function unzip_robot(zipFilePath, extractTo, onTaskFinished) {
  const zip = new AdmZip(zipFilePath);

  try {
    zip.extractAllTo(extractTo, true); // true to overwrite existing files
    console.log("Successfully extracted the zip file.");

    onTaskFinished({ success: true });

    //removing .zip from the end
    folderName = zipFilePath.substring(0, zipFilePath.length - 4);

    // execute_robot(folderName);
  } catch (error) {
    console.error("unzip_robot: Error extracting the zip file:", error);
    e = "unzip_robot: Error extracting the zip file:" + error;
    onTaskFinished({ success: false, message: e });
  }
}

function zip_robot_output(folderPath, outputZipFilePath,run_id) {
  folderPath += "/output";
  outputZipFilePath += "/output.zip";
  const zip = new AdmZip();

  // Get all files and subdirectories in the folder
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    // Check if it's a file or a directory
    if (fs.lstatSync(filePath).isDirectory()) {
      // Add the directory to the zip
      zip.addLocalFolder(filePath, file);
    } else {
      // Add the file to the zip
      zip.addLocalFile(filePath);
    }
  }

  // Write the zip file
  zip.writeZip(outputZipFilePath);
  uploadZipFileAndCreateEntry(outputZipFilePath,run_id)
  
  console.log(
    `Folder ${folderPath} successfully zipped to ${outputZipFilePath}`
  );
}

module.exports = {
  executeCommand,
};
