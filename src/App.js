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
import { useMemo } from 'react';
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
  const [financialYear, setFinancialYear] = useState(localStorage.getItem('financialYear') || '');

  const base_url = process.env.REACT_APP_API_URL;
  const dsm_url = process.env.REACT_APP_DSM_URL;



  const fetchData = useMemo(() => async () => {
    try {
      const response = await axios.post(
        `${base_url}/login//${financialYear}`,
        {
          "mobile_no": userMobile,
          "password": "12345678"
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
  }, [base_url, financialYear, userMobile]);

  useEffect(() => {
    if (isAuthenticated && !data) {
      fetchData();
    }
  }, [isAuthenticated, data, fetchData]);

  // const formatDate = (dateString) => {
  //   const [year, month, day] = dateString.split('-');
  //   return `${day}/${month}/${year}`;
  // };

  // useEffect(() => {
  //   if (data && base_url) {
  //     axios
  //       .post(`${base_url}/currentShiftData/1`,
  //         {
  //           "petro_id": data.petro_id,
  //         })
  //       .then((response) => {
  //         const { shift, day_shift_no, date } = response.data.data.DailyShift;
  //         const formattedDate = formatDate(date);
  //         setShiftData({ shift, day_shift_no, formattedDate, date });
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching data:", error);
  //       });
  //   }
  // }, [data, base_url]);


  if (data === null && isAuthenticated) {
    return <p>Loading...</p>;
  }



  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path={`${dsm_url}/`} element={<Home petrodata={data} />} />
          <Route path={`${dsm_url}/login`} element={<LoginPage setUserMobile={setUserMobile} financialYear={financialYear} setFinancialYear={setFinancialYear} setIsAuthenticated={setIsAuthenticated} setData={setData} />} />
          <Route path={`${dsm_url}/receipt`} element={isAuthenticated ? <Receipt financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/reset-mpin`} element={isAuthenticated ? <ResetMPIN financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/setup-mpin`} element={isAuthenticated ? <SetupMPIN financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/logout`} element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
          <Route path={`${dsm_url}/mpin-login`} element={isAuthenticated ? <MPINLogin financialYear={financialYear} isAuthenticated={isAuthenticated} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/noozle-reading`} element={isAuthenticated ? <NoozleReading financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/expenses`} element={isAuthenticated ? <Expenses financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/OtherCreditSale`} element={isAuthenticated ? <OtherCreditSale financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/MsHsdCreditSale`} element={isAuthenticated ? <MsHsdCreditSale financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/dashboard`} element={isAuthenticated ? <DashBoard financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/wallet`} element={isAuthenticated ? <Wallet financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/card`} element={isAuthenticated ? <Card financialYear={financialYear} petrodata={data} /> : <Navigate to={`${dsm_url}/login`} />} />
          <Route path={`${dsm_url}/*`} element={<Navigate to={`${dsm_url}/`} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
