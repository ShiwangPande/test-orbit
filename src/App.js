import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import "./App.css";
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
import Navbar from './components/Navbar';
function App() {
  const [data, setData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userMobile, setUserMobile] = useState(localStorage.getItem('userMobile') || '');
  const base_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${base_url}/login/1`,
          {
            "mobile_no": userMobile,
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

    if (userMobile) {
      fetchData();
    }
  }, [base_url, userMobile]);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (data === null && isAuthenticated) {
    return <p>Loading...</p>;
  }

  return (
    <div className="App">
      <Router>
        <Routes>

          <Route path="/" element={<Home data={data} />} />
          <Route path="/login" element={<LoginPage setUserMobile={setUserMobile} setIsAuthenticated={setIsAuthenticated} setData={setData} />} />
          <Route path="/receipt" element={isAuthenticated ? <Receipt petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/reset-mpin" element={<ResetMPIN petrodata={data} />} />
          <Route path="/setup-mpin" element={<SetupMPIN petrodata={data} />} />
          <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/mpin-login" element={isAuthenticated ? <MPINLogin isAuthenticated={isAuthenticated} petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/noozle-reading" element={isAuthenticated ? <NoozleReading petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/expenses" element={isAuthenticated ? <Expenses petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/credit-sale" element={isAuthenticated ? <CreditSale petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/cash-sale" element={isAuthenticated ? <CashSale petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashBoard petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/cardwallet" element={isAuthenticated ? <CardWallet petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
