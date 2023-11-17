import InstallAssistantListItem from "./InstallAssistantListItem";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Skeleton } from "@mui/material";

import {
  DOWNLOAD_ROBOT_COMMAND_REPLY,
  EXECUTE_COMMAND_FROM_MAIN,
  EXECUTE_COMMAND_FROM_MAIN_REPLY,
  FETCH_REMOTE_ROBOTS_COMMAND,
  FETCH_REMOTE_ROBOTS_COMMAND_REPLY,
  FETCH_ROBOTS_COMMAND,
  FETCH_ROBOTS_COMMAND_REPLY,
  SEPARATOR,
} from "../utils/constants";
import { useEffect } from "react";
const { ipcRenderer } = window.require("electron");
import { Button } from "primereact/button";
const InstallAssistants = () => {
  const navigate = useNavigate();

  const [assistants, setAssistants] = useState([]);
  const [installedAssistants, setInstalledAssistants] = useState([]);

  function installNewAssistants() {
    navigate(`/install_assistants`);
  }

  function refreshAssistants() {
    setAssistants([]);
    setTimeout(() => {
      setAssistants(loadAssistants());
    }, 2000);
  }

  function loadAssistants() {
    ipcRenderer.once(EXECUTE_COMMAND_FROM_MAIN_REPLY, (_event, result) => {
      
      if (result.event == FETCH_REMOTE_ROBOTS_COMMAND_REPLY) {
        if (result.success) {
          
          setAssistants(result.data);
        } else {
          alert(result.message);
          setAssistants([])
        }
      }
    });

    ipcRenderer.send(
      EXECUTE_COMMAND_FROM_MAIN,
      FETCH_REMOTE_ROBOTS_COMMAND + SEPARATOR + ""
    );

    // const ass = [{ name: "Example-google-image-search", id: 12345 }];
    //return ass;
  }

  function loadInstalledAssistants() {
    if(assistants.length==0){
      return
    }
    ipcRenderer.once(EXECUTE_COMMAND_FROM_MAIN_REPLY, (_event, result) => {
      if (result.event == FETCH_ROBOTS_COMMAND_REPLY) {
        let arr = [];
        result.data.forEach((item) => {
          arr.push(item.id);
        });
        setInstalledAssistants(arr);
      }
    });

    ipcRenderer.send(
      EXECUTE_COMMAND_FROM_MAIN,
      FETCH_ROBOTS_COMMAND + SEPARATOR + ""
    );
  }

  useEffect(() => {
    loadInstalledAssistants();
  }, [assistants]);

  useEffect(() => {
    // fetch assistants
    loadAssistants();
  }, []);

  if (assistants.length == 0) {
    return (
      <div className="content">
      <div className="assistantListItem">
            <h5>No Assistants Available</h5>
            
          </div>
          </div>
    );
  }

  return (
    <div className="content">
      <div className="titleBar">
        <span className="title leftContent">Available Assistants </span>

        <span className="rightContent"></span>
      </div>

      <div className="">
        {assistants.map((assistant) => {
          return installedAssistants.includes(assistant.id) ? (
            <InstallAssistantListItem assistant={assistant} installed={true} />
          ) : (
            <InstallAssistantListItem assistant={assistant} installed={false} />
          );
        })}
      </div>
      <br />
      <br />

      <Button
        onClick={() => {
          navigate("/home");
        }}
        label="Cancel"
      />
    </div>
  );
};

export default InstallAssistants;
