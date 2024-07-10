import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import "./App.css";
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import NoozleReading from './pages/NoozleReading';
import Receipt from './pages/Receipt';
import Expenses from './pages/Expenses';
import OtherCreditSale from './pages/OtherCreditSale';
import MsHsdCreditSale from './pages/MsHsdCreditSale';

import DashBoard from './pages/DashBoard';
import MPINLogin from './components/MPINLogin';
import SetupMPIN from './components/SetupMPIN';
import ResetMPIN from './components/ResetMPIN';
import Logout from "./components/Logout";
import Wallet from './pages/Wallet';
import Card from './pages/Card';


function App() {
  const [data, setData] = useState(JSON.parse(localStorage.getItem('userData')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [userMobile, setUserMobile] = useState(localStorage.getItem('userMobile') || '');
  const base_url = process.env.REACT_APP_API_URL;



  useEffect(() => {
    if (isAuthenticated && !data) {
      const fetchData = async () => {
        try {
          const response = await axios.post(
            `${base_url}/login/1`,
            {
              "mobile_no": userMobile,
              "password": "12345678" // Adjust this if needed
            }
          );
          console.log('Login successful. Data:', response.data);
          setData(response.data);
          localStorage.setItem('userData', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error logging in:', error);
          setIsAuthenticated(false);
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userMobile');
          localStorage.removeItem('userData');
        }
      };
      fetchData();
    }
  }, [base_url, isAuthenticated, userMobile, data]);

  if (data === null && isAuthenticated) {
    return <p>Loading...</p>;
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home petrodata={data} />} />
          <Route path="/login" element={<LoginPage setUserMobile={setUserMobile} setIsAuthenticated={setIsAuthenticated} setData={setData} />} />
          <Route path="/receipt" element={isAuthenticated ? <Receipt petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/reset-mpin" element={isAuthenticated ? <ResetMPIN petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/setup-mpin" element={isAuthenticated ? <SetupMPIN petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/mpin-login" element={isAuthenticated ? <MPINLogin isAuthenticated={isAuthenticated} petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/noozle-reading" element={isAuthenticated ? <NoozleReading petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/expenses" element={isAuthenticated ? <Expenses petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/OtherCreditSale" element={isAuthenticated ? <OtherCreditSale petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/MsHsdCreditSale" element={isAuthenticated ? <MsHsdCreditSale petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashBoard petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/wallet" element={isAuthenticated ? <Wallet petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="/card" element={isAuthenticated ? <Card petrodata={data} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
