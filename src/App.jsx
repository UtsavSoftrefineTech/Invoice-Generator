import "./App.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <div className="h-screen w-full">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </>
  );
}

export default App;
