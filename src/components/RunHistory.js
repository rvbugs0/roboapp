import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import { useLocation } from "react-router-dom";
import { EXECUTE_COMMAND_FROM_MAIN, OPEN_DIRETORY_COMMAND } from "../utils/constants";
import { prepareOpenDirectoryCommand } from "../utils/CommandUtils";
const { ipcRenderer } = window.require("electron");

const runStatusBodyTemplate = (item) => {
  return (
    <Tag value={getRunStatus(item)[0]} severity={getRunStatus(item)[1]}></Tag>
  );
};

const outputDirectoryBodyTemplate = (item) => {
  
  if(item.run_status==1){
    return (
      <Tag
        value="Open"
        severity="success"
        onClick={() => openOutputDirectory(item.output_directory+"/"+item.id)}
      ></Tag>
    );
  }else{
    return (<span></span>)
  }

};

function openOutputDirectory(directoryPath) {

ipcRenderer.send(OPEN_DIRETORY_COMMAND,directoryPath);

}

const getRunStatus = (item) => {
  let runStatus = item.run_status;

  switch (runStatus) {
    case 0:
      return ["Pending", "warning"];

    case 1:
      return ["Completed", "success"];

    case -1:
      return ["Failed", "danger"];

    default:
      return [null, null];
  }
};

export default () => {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const robotId = searchParams.get("robotId");
  const [customers, setCustomers] = useState([
    {
      runId: 1000,
      robotId: 12354,
      assistant_name: "Assistant-1",
      run_status: 1,
      start_time: 123569,
      end_time: 123569,
    },
  ]);

  useEffect(() => {
    ipcRenderer.on("getRunRecordsReply", (_event, result) => {
      setCustomers(result);
    });
    ipcRenderer.send("getRunRecords",robotId);
  }, []);

  return (
    <>
      <div className="content">
        <DataTable
          value={customers}
          scrollable
          scrollHeight="400px"
          style={{ minWidth: "25rem" }}
        >
          {/* <Column field="robo_id" header="Asst. Name"></Column> */}
          <Column field="start_time" header="Start time"></Column>
          <Column field="end_time" header="End time"></Column>
          <Column body={runStatusBodyTemplate} header="Run Status"></Column>
          <Column body={outputDirectoryBodyTemplate} header="Output"></Column>
        </DataTable>
      </div>
    </>
  );
};
