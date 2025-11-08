import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layout/AuthLayout.jsx";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/auth"
        element={
            <AuthLayout />
        }
      >
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
}


