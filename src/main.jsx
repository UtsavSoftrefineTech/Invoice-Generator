import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Help from "./components/Help/Help.jsx";
import Guide from "./components/Guide/Guide.jsx";
import Template from "./components/Template/Template.jsx";
import "./index.css";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import History from "./components/History/History.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Template />} />
      <Route path="help" element={<Help />} />
      <Route path="guide" element={<Guide />} />
      <Route path="history" element={<History />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
