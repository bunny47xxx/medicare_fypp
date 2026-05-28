import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import Register from "../pages/RegisterPage";
import Login from "../pages/LoginPage";


import Doctor from "../pages/doctor/Doctor";
import Admin from "../pages/admin/Admin";
import User from "../pages/user/User";
import FindDoctor from "../pages/user/FindDoctor";
import ViewRecords from "../pages/user/ViewRecords";

import LandingPage from "../pages/LandingPage";
import ServicesPage from "../pages/ServicesPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import PaymentVerify from "../pages/PaymentVerify";
import VideoCall from "../pages/VideoCall";

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
        <Route path="/find-doctor" element={<FindDoctor />} />
        <Route path="/records" element={<ViewRecords />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />
        <Route path="/video-call" element={<VideoCall />} />
    </Routes>

  )
}
