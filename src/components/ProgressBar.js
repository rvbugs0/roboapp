import LinearProgress from "@mui/material/LinearProgress";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProgressBar = () => {
  const [loaderMessage, setLoaderMessage] = useState("");
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    c = 0;
    t = setInterval(() => {
      if (c > 100) {
        clearInterval(t);
      } else {
        setCount(c++);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (count >= 100) {
      setLoaderMessage("Finished");
      navigate(`/home`);
    } else {
      // if (count % 10 == 0) {
        setLoaderMessage("Progress: " + count + "%");
      // }
    }
  }, [count]);
  return (
    <div className="center">
      <LinearProgress />
      <h3>Fetching robots: {loaderMessage}</h3>
    </div>
  );
};

export default ProgressBar;
