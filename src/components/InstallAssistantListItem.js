import { Button } from "primereact/button";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import DeleteIcon from '@mui/icons-material/Delete';
import { prepareDownloadRobotCommand } from "../utils/CommandUtils";
import { DOWNLOAD_ROBOT_COMMAND_REPLY, EXECUTE_COMMAND_FROM_MAIN, EXECUTE_COMMAND_FROM_MAIN_REPLY } from "../utils/constants";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";




const { ipcRenderer } = window.require("electron");

const AssistantListItem = ({assistant,installed})=>{
  const navigate = useNavigate();
  function handleDownloadClick(assistantObject) {

    // alert(JSON.stringify(assistantObject))
    let downloadCommand = prepareDownloadRobotCommand(assistantObject.id,assistantObject.robot_url,assistantObject.directory_name+".zip");
    
    
    ipcRenderer.once(EXECUTE_COMMAND_FROM_MAIN_REPLY, (_event, result) => {
      if (result?.event == DOWNLOAD_ROBOT_COMMAND_REPLY) {
        if (result?.message) {
          navigate("/home");
          // alert(result.message);
        }
        
      }});
    ipcRenderer.send(EXECUTE_COMMAND_FROM_MAIN, downloadCommand);
  }

  

    return (
        <div className="assistantListItem">
        <span className="leftContent">{assistant.name}</span>
        <span className="rightContent">
          {installed?(<Button 
        
         label="Installed"
         icon="pi pi-download"
          disabled
        />
          
        ):(<Button 
          onClick={()=>handleDownloadClick(assistant)}
           label="Download"
           icon="pi pi-download"
  
          />
  )}

        
        

        </span>
        </div>
    )
}

export default AssistantListItem;