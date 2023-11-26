const https = require("https");

const { exec } = require("child_process");

const {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  dialog,
  shell,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
// const preloadScriptPath = path.join(__dirname, "preload.js");
const fs = require("fs");
const { executeCommand } = require("./src/utils/command_execution");
const { getRunRecords, getDBConnection } = require("./src/utils/db");
const { error } = require("console");
const {
  EXECUTE_COMMAND_FROM_MAIN,
  EXECUTE_COMMAND_FROM_MAIN_REPLY,
  WORKING_DIRECTORY,
  OPEN_DIRETORY_COMMAND,
  DEFAULT_OUTPUT_DIRECTORY,
  ROBOTS_DIRECTORY,
} = require("./src/utils/constants");
const { uploadZipFileAndCreateEntry } = require("./src/utils/supabase_utils");

let mainWindow;

function init() {
  // Check if the directory exists, and if not, create it
  if (!fs.existsSync(DEFAULT_OUTPUT_DIRECTORY)) {
    try {
      fs.mkdirSync(DEFAULT_OUTPUT_DIRECTORY, { recursive: true });
      console.log("Default output directory created successfully.");

      //this will create db
      getDBConnection();

      //copy the rcc executable to working directory
      if(process.platform == 'darwin'){
        downloadRCCForMac();

      }else{
        downloadRCCForWindows();
      }
      
    } catch (error) {
      console.error("Error creating folder structure:", error);
    }
  } else {
    console.log("Folder structure already exists.");
  }
}

function downloadRCCForWindows() {
  const fileURL =
    "https://downloads.robocorp.com/rcc/releases/latest/windows64/rcc.exe";
  const downloadPath = WORKING_DIRECTORY + "/rcc.exe";

  // Download the file from the URL
  const file = fs.createWriteStream(downloadPath);
  const request = https.get(fileURL, (response) => {
    response.pipe(file);
    file.on("finish", () => {
      file.close(() => {
        console.log("Downloaded file successfully");

       
      });
    });
  });
}

function downloadRCCForMac() {
  const fileURL =
    "https://downloads.robocorp.com/rcc/releases/latest/macos64/rcc";
  const downloadPath = WORKING_DIRECTORY + "/rcc";

  // Download the file from the URL
  const file = fs.createWriteStream(downloadPath);
  const request = https.get(fileURL, (response) => {
    response.pipe(file);
    file.on("finish", () => {
      file.close(() => {
        console.log("Downloaded file successfully");

        // Make the downloaded file executable using chmod
        exec(`chmod a+x ${downloadPath}`, (error) => {
          if (error) {
            console.error("Error setting file permissions:", error);
          } else {
            console.log("File permissions set successfully");
          }
        });
      });
    });
  });

  request.on("error", (err) => {
    console.error("Error downloading file:", err);
  });

  request.end();
}

function createWindow() {
  init();


  

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Listen for the event in the main process
  ipcMain.on(EXECUTE_COMMAND_FROM_MAIN, (event, command) => {
    // Call the executeCommand function

    executeCommand(command, (result) => {
      event.reply(EXECUTE_COMMAND_FROM_MAIN_REPLY, result);
    });
  });

  ipcMain.on("select-directory", (event) => {
    dialog
      .showOpenDialog(mainWindow, {
        properties: ["openDirectory", "createDirectory"],
      })
      .then((result) => {
        if (!result.canceled) {
          const selectedDirectory = result.filePaths[0];
          event.reply("selected-directory", selectedDirectory);
        }
      });
  });

  ipcMain.on(OPEN_DIRETORY_COMMAND, (event, directoryPath) => {
    console.log(directoryPath);

    shell
      .openPath(directoryPath)
      .then(() => {
        console.log("Folder opened successfully");
      })
      .catch((err) => {
        console.error("Error opening folder:", err);
      });
  });

  ipcMain.on("getRunRecords", (event, robotId) => {
    getRunRecords(robotId, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        console.log("yaha aya");
        console.log(results);
        event.reply("getRunRecordsReply", results);
        // event.sender.send('sendRunRecords', JSON.stringify(results));
      }
    });
  });

  mainWindow.loadURL(
    !isDev
      ? "http://localhost:1234"
      : `file://${path.join(__dirname, "dist/index.html")}`
  );

  // let loadurl = `file://${path.join(__dirname,  "dist/index.html")}#/` 
  // mainWindow.loadURL(loadurl);  
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => (mainWindow = null));
}

app.whenReady().then(createWindow);
// ipcMain.handle("getRunRecords", async (event, command) => {
//   // Call the executeCommand function

//   //  getRunRecords((error,results)=>{
//   //   if(error){
//   //     console.log(error);
//   //     return []
//   //   }else{
//   //     // console.log("yaha aya")
//   //     // event.sender.send('sendRunRecords', JSON.stringify(results));
//   //     return results
//   //   }
//   // });

//   return [{"hello":"world"}]
// });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
