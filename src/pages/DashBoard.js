import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Plugins } from '@capacitor/core';



function DashBoard({ petrodata }) {
    const [creditdata, setCreditData] = useState([]);
    const nozzleData = JSON.parse(localStorage.getItem('submittedNozzleData')) || [];
    const CreditData = JSON.parse(localStorage.getItem('submittedData')) || [];
    const ExpensesData = JSON.parse(localStorage.getItem('submittedExpensesData')) || [];
    const RecieptData = JSON.parse(localStorage.getItem('submittedReceiptData')) || [];

    const hasValidReadings = (data) => {
        if (!data || !data.readings) return false;
        return Object.values(data.readings).some(
            (reading) => reading.sale !== 0 || reading.amount !== 0
        );
    };
    const { Device } = Plugins;
    function customFormat(number) {
        const [integerPart, decimalPart] = number.toString().split('.');
        let result = '';
        let i;

        // Handle the last three digits separately if length of integerPart > 3
        if (integerPart.length > 3) {
            result = integerPart.slice(-3);
            i = integerPart.length - 3;
        } else {
            result = integerPart;
            i = 0;
        }

        // Iterate from the remaining digits, adding commas every two digits
        for (i; i > 0; i -= 2) {
            const end = i;
            const start = Math.max(i - 2, 0);
            const chunk = integerPart.substring(start, end);
            result = chunk + (result ? ',' + result : '');
        }

        // Append the decimal part if it exists
        if (decimalPart) {
            result += '.' + decimalPart;
        }

        return result;
    }

    const hasValidData = (data) => data?.selectedCustomer;
    const hasValidExpenseData = (data) => data?.selectedLedgerName;
    const hasValidRecieptData = (data) => data?.selectedLedgerName;

    const filteredData = nozzleData.filter(hasValidReadings);
    const filteredCreditData = CreditData.filter(hasValidData);
    const filteredExpensesData = ExpensesData.filter(hasValidExpenseData);
    const filteredRecieptData = RecieptData.filter(hasValidRecieptData);

    let totalAmount = 0;
    filteredData.forEach(data => {
        Object.values(data.readings).forEach(reading => {
            if (reading.amount !== 0) {
                totalAmount += parseFloat(reading.amount);
            }
        });
    });

    let total_credit_amount = 0;
    let total_driver_cash = 0;
    let total_expenses = 0;
    let total_receipt = 0;

    filteredCreditData.forEach(data => {
        if (data.totalAmt) {
            total_credit_amount += parseFloat(data.totalAmt);
        }
    });

    filteredCreditData.forEach(data => {
        if (data.driverCash > 0) {
            total_driver_cash += parseFloat(data.driverCash);
        }
    });

    filteredExpensesData.forEach(data => {
        if (data.amount) {
            total_expenses += parseFloat(data.amount);
        }
    });

    filteredRecieptData.forEach(data => {
        if (data.amount) {
            total_receipt += parseFloat(data.amount);
        }
    });

    total_credit_amount = parseFloat(total_credit_amount).toFixed(2);
    let cashsale = totalAmount - total_credit_amount;
    cashsale = parseFloat(cashsale).toFixed(2);

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const base_url = process.env.REACT_APP_API_URL;
    const formattedtotalAmount = customFormat(totalAmount);

    useEffect(() => {
        axios.post(
            `${base_url}/empcurrentShiftData/7/24/1`,
            {
                shift: 11,
                emp_id: "24",
                date: "2024-04-11",
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            }
        )
            .then(response => {
                const { shift, day_shift_no, date } = response.data.data.DailyShift;
                const formattedDate = formatDate(date);
                setCreditData({ shift, day_shift_no, date: formattedDate });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, petrodata.daily_shift, base_url]);

    let cashBalance = 0;
    cashBalance = cashsale - total_driver_cash - total_expenses + total_receipt;

    const formattedcashBalance = customFormat(cashBalance);
    const formattedtotal_credit_amount = customFormat(total_credit_amount);
    const formattedcashsale = customFormat(cashsale);
    const formattedtotal_driver_cash = customFormat(total_driver_cash);
    const formattedtotal_expenses = customFormat(total_expenses);
    const formattedtotal_receipt = customFormat(total_receipt);

    const getTextStyle = (value) => ({
        color: value < 0 ? 'red' : 'black',
    });

    return (
        <div className="h-screen   flex bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 overflow-hidden bg-gray-100">
            <Navbar petrodata={petrodata} />
            <main className="flex-1 relative z-0 overflow-y-auto overflow-x-hidden  focus:outline-none">
                <h1 className='relative block  lg:hidden text-white mx-auto w-[70%] text-center top-4 text-2xl z-20'>DashBoard</h1>
                <div className='w-[90vw] lg:w-[80.5vw] bg-navbar lg:mt-5 mt-10 mx-5 fixed rounded-md px-8 py-5 '>
                    <div className="flex justify-between">
                        <h2 className="block text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                            Date: <span className='text-red-500 font-medium'>{creditdata.date}</span>
                        </h2>
                        <h2 className="block text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">Shift: <span className='text-red-500 font-medium'>{creditdata.day_shift_no}</span></h2>
                    </div>
                </div>
                <div className=' mx-auto w-[90%] lg:w-1/2 lg:mx-auto my- rounded border-white p-5 mt-28 mb-1 lg:mt-28  bg-navbar'>
                    <h1 className='text-2xl w-full text-white mb-2 lg:hidden block text-center font-bold'>Hey, {petrodata.name}</h1>
                    <h1 className='text-xl lg:text-2xl w-full text-white  text-center font-bold'>Welcome to {petrodata.petro_name}</h1>
                  

                </div>
                <div className='flex flex-col bg-white border-3 drop-shadow-2xl border-black lg:w-1/2 lg:mx-auto rounded-lg justify-center mx-2 lg:mt-10'>
                    <div className='flex flex-col px-4 lg:px-10 w-full'>
                        {filteredData.length > 0 && (
                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-5'>
                                <h2 className="text-gray-700 text-lg col-span-2 lg:col-span-4 lg:text-xl font-semibold">Total Sale Amount</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-4 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(totalAmount)}>₹{formattedtotalAmount}</h1>
                            </div>
                        )}
                        {filteredCreditData.length > 0 && (
                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-5'>
                                <h2 className="text-gray-700 text-lg col-span-2 lg:col-span-4 lg:text-xl font-semibold">Total Credit Amount</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-4 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(total_credit_amount)}>₹{formattedtotal_credit_amount}</h1>
                            </div>
                        )}
                        {filteredCreditData.length > 0 && (
                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-5'>
                                <h2 className="text-gray-700 text-lg col-span-2 lg:col-span-4 lg:text-xl font-semibold">Cash Sale Amount</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-4 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(cashsale)}>₹{formattedcashsale}</h1>
                            </div>
                        )}
                        {filteredCreditData.length > 0 && (
                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-5'>
                                <h2 className="text-gray-700 text-lg col-span-2 lg:col-span-4 lg:text-xl font-semibold">Driver Cash</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-4 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(total_driver_cash)}>₹{formattedtotal_driver_cash}</h1>
                            </div>
                        )}
                        {filteredExpensesData.length > 0 && (
                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-5'>
                                <h2 className="text-gray-700 text-lg col-span-2 lg:col-span-4 lg:text-xl font-semibold">Total Expense</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-4 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(total_expenses)}>₹{formattedtotal_expenses}</h1>
                            </div>
                        )}
                        {filteredRecieptData.length > 0 && (
                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-5'>
                                <h2 className="text-gray-700 text-lg col-span-2 lg:col-span-4 lg:text-xl font-semibold">Total Receipt</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-4 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(total_receipt)}>₹{formattedtotal_receipt}</h1>
                            </div>
                        )}
                        <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-5'>
                            <h2 className="text-gray-700 text-lg col-span-2 lg:col-span-4 lg:text-xl font-semibold">Cash Balance</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-4 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(cashBalance)}>₹{formattedcashBalance}</h1>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashBoard;
