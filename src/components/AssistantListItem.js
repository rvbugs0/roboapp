import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
const { ipcRenderer } = window.require("electron");
const electron = window.require("electron");
import { useNavigate } from "react-router-dom";
import {
  EXECUTE_COMMAND_FROM_MAIN,
  EXECUTE_COMMAND_FROM_MAIN_REPLY,
  EXECUTE_ROBOT_COMMAND_REPLY,
  UPDATE_OUTPUT_DIRECTORY_COMMAND,
} from "../utils/constants";

import {
  prepareDeleteRobotCommand,
  prepareDownloadRobotCommand,
  prepareExecuteRobotCommand,
  prepareUpdateRobotOutputFolderCommand,
} from "../utils/CommandUtils";
import React, { useRef } from "react";
const AssistantListItem = ({ assistant, loaderToggle, refreshMethod }) => {
  const menu = useRef(null);
  const items = [
    
    {
      command: () => {
        handleSelectOutputLocation(assistant.id);
      },
      label: "Change output directory",
    },{
      command: () => {
        handleDeleteRobot(assistant.id);
      },
      label: "Delete",
    },
  ];

  function handleDeleteRobot(robotId) {
    // alert(robotId)
    loaderToggle(true);
    ipcRenderer.send(
      EXECUTE_COMMAND_FROM_MAIN,
      prepareDeleteRobotCommand(robotId)
    );
    setTimeout(() => {
      refreshMethod();
    }, 1000);
  }

  function handleStartClick(robotId) {
    loaderToggle(true);
    ipcRenderer.once(EXECUTE_COMMAND_FROM_MAIN_REPLY, (_event, result) => {
      loaderToggle(false);
      if (result.error == true) {
        // alert(result.error);
        alert(result.data);
      } else {
        if (result.event == EXECUTE_ROBOT_COMMAND_REPLY) {
          alert(result.data);
        }
      }
    });
    ipcRenderer.send(
      EXECUTE_COMMAND_FROM_MAIN,
      prepareExecuteRobotCommand(robotId)
    );
    // command = prepareDownloadRobotCommand(12345,"https://codeload.github.com/robocorp/example-google-image-search/zip/refs/heads/main","example-google-image-search-main.zip");
    // ipcRenderer.send(EXECUTE_COMMAND_FROM_MAIN, command);
  }
  const navigate = useNavigate();

  function loadRunHistory(robotId) {
    navigate("/run_history?robotId=" + robotId);
  }

  const handleSelectOutputLocation = (robotId) => {
    
    ipcRenderer.once("selected-directory", (event, selectedDirectory) => {
      ipcRenderer.send(
        EXECUTE_COMMAND_FROM_MAIN,
        prepareUpdateRobotOutputFolderCommand(robotId, selectedDirectory)
      );

      alert(`Selected directory: ${selectedDirectory}`);

      // You can now use selectedDirectory as needed
    });

    ipcRenderer.send("select-directory");

  };

  return (
    <div className="assistantListItem">
      <span className="leftContent">{assistant.name}</span>
      <span className="rightContent">
        <Button
          onClick={() => handleStartClick(assistant.id)}
          label=""
          icon="pi pi-play"
        ></Button>
        &nbsp;&nbsp;
        <Button
          label="History"
          icon="pi pi-list"
          onClick={() => loadRunHistory(assistant.id)}
        ></Button>
        &nbsp;&nbsp;
        <TieredMenu model={items} popup ref={menu} breakpoint="767px" />
        <Button
          label=""
          icon="pi pi-ellipsis-h"
          onClick={(e) => menu.current.toggle(e)}
        />
      </span>
    </div>
  );
};

export default AssistantListItem;
