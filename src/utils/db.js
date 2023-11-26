const fs = require("fs");

const {
  SQLITE_PATH,
  WORKING_DIRECTORY,
  DEFAULT_OUTPUT_DIRECTORY,
} = require("./constants");
const { getUUID } = require("./app_utils");
const sqlite3 = require("sqlite3").verbose();

function Robot() {
  this.id = "";
  this.name = "";
  this.robot_url = "";
  this.directory_name = "";
  this.output_directory_path = "";
}

function RunInfo() {
  this.id = "";
  this.roboId = "";
  this.runStatus = "";
  this.outputDirectory = "";
}

function getDBConnection() {
  let db = undefined;
  if (!fs.existsSync(SQLITE_PATH)) {
    db = new sqlite3.Database(SQLITE_PATH, (error) => {
      if (error) {
        return console.error(error.message);
      }

      createTable(db);
    });
    console.log("Connection with SQLite has been established");
    return db;
  } else {
    db = new sqlite3.Database(SQLITE_PATH, (error) => {
      if (error) {
        return console.error(error.message);
      }
    });
    console.log("Connection with SQLite has been established");
    return db;
  }
}

function addNewRobotRecord(robot) {
  console.log(robot);
  let sql =
    "INSERT INTO robot (id,name,directory_name ) values(" +
    robot.id +
    ',"' +
    robot.name +
    '","' +
    robot.directory_name +
    '")';

  db = getDBConnection();

  db.run(sql, undefined, function (err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
  db.close();
}

function getRunDataById(id, onResultsFetched) {
  const query = "SELECT * FROM run_data WHERE id = ?";
  db = getDBConnection();
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Error:", err);
      onResultsFetched(true, "Error:" + err);
    }

    if (row) {
      console.log("Run Data Record:", row);
      onResultsFetched(false, row);
    } else {
      console.log("No run_data record found with the provided id.");
      onResultsFetched(true, "No run_data record found with the provided id.");
    }
  });
}

function createTable(db) {
  db.exec(`
  CREATE TABLE run_data
  (
    id VARCHAR(100) PRIMARY KEY,
    robot_id INTEGER NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    run_status INTEGER DEFAULT 0,
    output_directory VARCHAR(300),
    FOREIGN KEY (robot_id) REFERENCES robot(id) ON DELETE CASCADE
  );
  

    CREATE TABLE robot
    (
      id INTEGER NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      robot_url VARCHAR(500),
      directory_name VARCHAR(100) NOT NULL,
      output_directory_path VARCHAR(300) DEFAULT '${DEFAULT_OUTPUT_DIRECTORY}'
    );
    
  `);
}

function addRunRecord(runInfo, onExecuted) {
  const uuid = getUUID();
  console.log(runInfo);
  let sql =
    'INSERT INTO run_data (id,robot_id,output_directory) values("' +
    uuid +
    '","' +
    runInfo.roboId +
    '","' +
    runInfo.outputDirectory +
    '")';

  db = getDBConnection();

  db.run(sql, undefined, function (err) {
    if (err) {
      console.log(err.message);
      onExecuted(true, err.message);
    }
    // get the last insert id
    // console.log(`A row has been inserted with rowid ${this.lastID}`);
    onExecuted(false, uuid);
  });
  db.close();
}

function updateRunRecord(run_id, success) {
  let run_status;
  success == true ? (run_status = 1) : (run_status = -1);
  // Get the current time
  const currentTime = new Date().toISOString();

  let sql = `UPDATE run_data SET end_time = ?, run_status = ? WHERE id = ?`;

  db = getDBConnection();

  db.run(sql, [currentTime, run_status, run_id], function (err) {
    if (err) {
      return console.log(err.message);
    }
    // Check the number of rows affected (should be 1 if the update was successful)
    if (this.changes === 1) {
      console.log(`Run record with ID ${run_id} has been updated.`);
    } else {
      console.log(
        `No rows were updated. Run record with ID ${run_id} may not exist.`
      );
    }
  });

  db.close();
}

function getRobotById(id, onResultsFetched) {
  const tableName = "robot"; // Name of the table you want to retrieve records from

  // Query to select all records from the specified table
  const query = `SELECT * FROM ${tableName} where id = ${id}`;

  db = getDBConnection();
  // Execute the query and fetch all records
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error querying database:", err.message);
      onResultsFetched(true, "Error querying database:" + err.message);
    } else {
      if (rows.length > 0) {
        onResultsFetched(false, rows[0]);
        // console.log(rows[0])
      } else {
        onResultsFetched(true, "No records found");
      }
    }

    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  });
}

function updateRobotOutputPath(robotId, newPath) {
  db = getDBConnection();
  db.run(
    "UPDATE robot SET output_directory_path = ? WHERE id = ?",
    [newPath, robotId],
    function (err) {
      if (err) {
        console.error("Error updating output path:", err.message);
        return;
      }
      console.log(`Updated output path for robot with ID ${robotId}`);
    }
  );
}

function getRunRecords(robotId, onResultsFetched) {
  result = [];
  const tableName = "run_data"; // Name of the table you want to retrieve records from

  // Query to select all records from the specified table
  const query = `SELECT * FROM ${tableName} where robot_id =${robotId}`;

  db = getDBConnection();
  // Execute the query and fetch all records
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error querying database:", err.message);
      onResultsFetched("Error querying database:", err.message, undefined);
    }

    // // Print the retrieved records
    // rows.forEach((row) => {

    // });
    // console.log(rows)
    onResultsFetched(false, rows);

    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  });

  return result;
}

function getAllRobots(onResultsFetched) {
  const tableName = "robot"; // Name of the table you want to retrieve records from

  const query = `SELECT * FROM ${tableName}`;

  db = getDBConnection();
  // Execute the query and fetch all records
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error querying database:", err.message);
      onResultsFetched(true, "Error querying database:", err.message);
    }

    onResultsFetched(false, rows);

    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  });
}

function deleteRobot(robotId) {
  const sql = "DELETE FROM robot WHERE id = ?";
  db = getDBConnection();
  // Run the query to delete the robot
  db.run(sql, [robotId], function (err) {
    if (err) {
      console.error("Error deleting robot:", err.message);
    } else {
      console.log(`Deleted robot with ID: ${robotId}`);
    }

    // Close the database connection
    db.close();
  });
}

module.exports = {
  getDBConnection,
  addRunRecord,
  getRunRecords,
  addNewRobotRecord,
  getRobotById,
  updateRobotOutputPath,
  RunInfo,
  Robot,
  updateRunRecord,
  getRunDataById,
  getAllRobots,
  deleteRobot,
};
