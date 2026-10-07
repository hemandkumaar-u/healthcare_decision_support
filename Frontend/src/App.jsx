import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientInput from "./pages/PatientInput";
import Prediction from "./pages/Prediction";
import History from "./pages/History";
import About from "./pages/About";

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/patient/new" element={<PatientInput />} />

        <Route path="/prediction" element={<Prediction />} />

        <Route path="/history" element={<History />} />

        <Route path="/about" element={<About />} />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;