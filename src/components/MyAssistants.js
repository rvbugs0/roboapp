//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";


import FullScreenLoader from "./FullScreenLoader";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";

import AssistantListItem from "./AssistantListItem";
import Skeleton from "@mui/material/Skeleton";

import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import {
  EXECUTE_COMMAND_FROM_MAIN,
  EXECUTE_COMMAND_FROM_MAIN_REPLY,
  EXECUTE_ROBOT_COMMAND,
  EXECUTE_ROBOT_COMMAND_REPLY,
  FETCH_ROBOTS_COMMAND,
  FETCH_ROBOTS_COMMAND_REPLY,
  SEPARATOR,
} from "../utils/constants";
import { Button } from "primereact/button";
const { ipcRenderer } = window.require("electron");

const MyAssistants = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [assistants, setAssistants] = useState([]);

  function installNewAssistants() {
    navigate(`/install_assistants`);
  }

  function refreshAssistants() {
    // alert(ROBOTS_DIRECTORY)
    setIsLoading(true);
    setAssistants([]);
    setTimeout(() => {
      loadAssistants();
    }, 1000);
  }

  function loadAssistants() {

    ipcRenderer.once(EXECUTE_COMMAND_FROM_MAIN_REPLY, (_event, result) => {
      setIsLoading(false);
      if (result.error == true) {
        // alert(result.error);
        alert(result.data);
      } else {
        if (result.event == FETCH_ROBOTS_COMMAND_REPLY) {
          setAssistants(result.data);
        } 
      }
    });

    ipcRenderer.send(
      EXECUTE_COMMAND_FROM_MAIN,
      FETCH_ROBOTS_COMMAND + SEPARATOR + ""
    );
  }

  useEffect(() => {
    

    loadAssistants();
  }, []);

  return (
    <div className="content">
      <div className="titleBar">
        <span className="title leftContent">My Assistants </span>

        <span className="rightContent">
          <Button
            
            icon="pi pi-plus"
            onClick={installNewAssistants}
            label="Add"
          />
            
          
          &nbsp;&nbsp;
          <Button
            label=""
            variant="contained"
            icon="pi pi-refresh"
            onClick={refreshAssistants}
          />
          
          
        </span>
      </div>

      <div className="restaurant-list">
        {assistants.length != 0 ? (
          assistants.map((assistant) => {
            return (
              <AssistantListItem
                loaderToggle={setIsLoading}
                refreshMethod={refreshAssistants}
                assistant={assistant}
              />
            );
          })
        ) : (
          <div className="assistantListItem">
            <h5>No Assistants Installed</h5>
            
          </div>
        )}
      </div>
      <FullScreenLoader isLoading={isLoading} />
    </div>
  );
};

export default MyAssistants;
