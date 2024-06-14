import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import NoozleReading from './pages/NoozleReading';
import Receipt from './pages/Receipt';
import Expenses from './pages/Expenses';
import CreditSale from './pages/CreditSale';
import CashSale from './pages/CashSale';
import Layout from './components/Layout';
import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';

function App() {
  const [data, setData] = useState([]);
  const base_url = process.env.REACT_APP_API_URL;
  useEffect(() => {
    axios.post(
      `${base_url}/petro_cake/petroAppEmployees/login/1`,
      {
        "mobile_no": 8459795840,
        "password": "12345678"
      }
    )
      .then(response => {
        console.log(data.mobile_no)
        console.log('data:', response.data); // Log the received data
        setData(response.data);
        // Set loading state to false when data is received
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        // Set loading state to false in case of error
      });
  }, [base_url, data.mobile_no]);



  return (
    <div className="App">
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/" element={<Home data={data} />} />
            <Route path="/login" element={<LoginPage data={data} />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/noozle-reading" element={<NoozleReading petrodata={data} />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/credit-sale" element={<CreditSale petrodata={data} />} />
            <Route path="/cash-sale" element={<CashSale />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
