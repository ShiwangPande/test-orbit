import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import "./App.css"
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import NoozleReading from './pages/NoozleReading';
import Receipt from './pages/Receipt';
import Expenses from './pages/Expenses';
import CreditSale from './pages/CreditSale';
import CashSale from './pages/CashSale';
import DashBoard from './pages/DashBoard';
import MPINLogin from './components/MPINLogin';
import SetupMPIN from './components/SetupMPIN';
import ResetMPIN from './components/ResetMPIN';
import Logout from "./components/Logout";
import CardWallet from './pages/CardWallet';
function App() {
  const [data, setData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const base_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${base_url}/petro_cake/petroAppEmployees/login/1`,
          {
            "mobile_no": 8459795840,
            "password": "12345678"
          }
        );
        console.log('Login successful. Data:', response.data);
        setData(response.data);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
      } catch (error) {
        console.error('Error logging in:', error);
      }
    };

    fetchData();
  }, [base_url, setIsAuthenticated]);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (data === null) {
    return <p>Loading...</p>; // Add loading indicator or spinner here
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home data={data} />} />
          <Route path="/login" element={<LoginPage data={data} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/receipt" element={isAuthenticated ? <Receipt petrodata={data} /> : <Navigate to="/mpin-login" />} />
          <Route path="/reset-mpin" element={<ResetMPIN />} />
          <Route path="/setup-mpin" element={<SetupMPIN />} />
          <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/mpin-login" element={<MPINLogin setIsAuthenticated={setIsAuthenticated} petrodata={data} />} />
          <Route path="/noozle-reading" element={isAuthenticated ? <NoozleReading petrodata={data} /> : <Navigate to="/mpin-login" />} />
          <Route path="/expenses" element={isAuthenticated ? <Expenses petrodata={data} /> : <Navigate to="/mpin-login" />} />
          <Route path="/credit-sale" element={isAuthenticated ? <CreditSale petrodata={data} /> : <Navigate to="/mpin-login" />} />
          <Route path="/cash-sale" element={isAuthenticated ? <CashSale petrodata={data} /> : <Navigate to="/mpin-login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashBoard petrodata={data} /> : <Navigate to="/mpin-login" />} />
          <Route path="/cardwallet" element={isAuthenticated ? <CardWallet petrodata={data} /> : <Navigate to="/mpin-login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
