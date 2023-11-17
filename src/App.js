import React from "react";
import ReactDOM from "react-dom/client";
import ProgressBar from "./components/ProgressBar";
import {
  createBrowserRouter,
  createHashRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import FooterComponent from "./components/FooterComponent";
import Home from "./components/Home";
import LoginLogout from "./components/LoginLogout";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";

import InstallAssistants from "./components/InstallAssistants";
import RunHistory from "./components/RunHistory";
import { PrimeReactProvider } from "primereact/api";

const AppLayout = () => {
  return (
    <div className="appLayout">
      <PrimeReactProvider>
        <HeaderComponent />
        <div className="main-content">
          <div className="outlet-container">
            <Outlet />
          </div>
        </div>
        <FooterComponent />
      </PrimeReactProvider>
    </div>
  );
};

const hashRouter = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,

    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/install_assistants",
        element: <InstallAssistants />,
      },
      {
        path: "/run_history",
        element: <RunHistory />,
      },
      ,

      {
        path: "/login_logout",
        element: <LoginLogout />,
      },
      {
        path: "*",
        element: <Home />,
      },
    ],
  },
]);

// const appRouter = createBrowserRouter([
//   {
//     path: "/",
//     element: <AppLayout />,

//     children: [
//       {
//         path: "/",
//         element: <Home />,
//       },
//       {
//         path: "/home",
//         element: <Home />,
//       },
//       {
//         path: "/install_assistants",
//         element: <InstallAssistants />,
//       },
//       {
//         path: "/run_history",
//         element: <RunHistory />,
//       },{
//         path:"*",
//         element:<Home/>
//       }

//     ],
//   },
// ]);

let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={hashRouter} />);
