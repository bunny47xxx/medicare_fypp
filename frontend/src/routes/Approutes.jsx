import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import Register from "../pages/RegisterPage";
import Login from "../pages/LoginPage";


import Doctor from "../pages/doctor/Doctor";
import Admin from "../pages/admin/Admin";
import User from "../pages/user/User";

import LandingPage from "../pages/LandingPage";
export default function Approutes(){
  return(
    <Routes>
    <Route path="/" element={<LandingPage/>}>
    </Route>
<Route
        path="/auth"
        element={
            <AuthLayout />
        }
      >
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Route>

        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/doctor" element={<Doctor />} />
    </Routes>

  )
}
