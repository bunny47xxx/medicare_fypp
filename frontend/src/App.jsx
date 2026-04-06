import { BrowserRouter } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Approutes from "./routes/Approutes.jsx"
import { ToastContainer } from "react-toastify";
export default function App() {
  return (
    <BrowserRouter>
      <Approutes />
      <ToastContainer position="top-right" autoClose={2000} pauseOnHover={false}  />
    </BrowserRouter>
  );
}
