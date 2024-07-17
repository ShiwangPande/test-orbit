import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

import { PuffLoader } from "react-spinners";



function DashBoard({ petrodata, financialYear }) {

    const [ShiftData, setShiftData] = useState("");
    const [msAndHsdSaleList, setmsAndHsdSaleList] = useState("");
    const [total_sale_amount, settotal_sale_amount] = useState(0);
    const base_url = process.env.REACT_APP_API_URL;
    const [cashSalesTotal, setCashSalesTotal] = useState("");
    const [otherSalesTotal, setOtherSalesTotal] = useState("");
    const [expensesVoucherList, setExpensesVoucherList] = useState("");
    const [recieptList, setRecieptList] = useState("");
    const [cardList, setCardSales] = useState("");
    const [walletList, setWallet] = useState("");
    const [shouldFetchAdd, setShouldFetchAdd] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (petrodata && base_url) {
            setLoading(true); // Start loading

            console.log("Fetching current shift data...");
            axios.post(`${base_url}/currentShiftData/${financialYear}`, {
                "petro_id": petrodata.petro_id,
            })
                .then((response) => {
                    console.log("Current shift data response:", response);
                    const { shift, day_shift_no, date } = response.data.data.DailyShift;
                    const formattedDate = formatDate(date);
                    const newShiftData = { shift, day_shift_no, formattedDate, date };
                    setShiftData(newShiftData);

                    // Now perform the second API call
                    return axios.post(`${base_url}/assignNozzleList/${financialYear}`, {
                        "shift": shift,
                        "emp_id": petrodata.user_id,
                        "date": date,
                        "petro_id": petrodata.petro_id,
                        "day_shift": petrodata.daily_shift,
                    });
                })
                .then((response) => {
                    console.log("Assign nozzle list response:", response);

                    if (response.status === 200 && response.data.status === 200) {
                        let noozleassigned = true;
                        if (response.data.data) {
                            console.log("nozzle assigned successfully.")
                        } else {
                            console.error("Unexpected response data structure:", response.data);
                        }
                        setShouldFetchAdd(noozleassigned);
                    } else {
                        console.log("No content returned from the API or unexpected status:", response.data);
                        setShouldFetchAdd(false);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    setShouldFetchAdd(false);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        }
    }, [petrodata, base_url]);
    useEffect(() => {
        if (petrodata && petrodata.user_id && petrodata.petro_id && petrodata.daily_shift && base_url) {
            axios
                .post(`${base_url}/currentShiftData/${financialYear}`,
                    {

                        petro_id: petrodata.petro_id,
                    })
                .then((response) => {
                    const { shift, day_shift_no, date } = response.data.data.DailyShift;
                    const formattedDate = formatDate(date);
                    setShiftData({ shift, day_shift_no, formattedDate, date });
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        }
    }, [petrodata, base_url]);

    useEffect(() => {
        if (petrodata && ShiftData && base_url) {
            axios.post(`${base_url}/msAndHsdSaleListByShift/${financialYear}`, {
                shift: `${ShiftData.shift}`,
                employee_id: petrodata.user_id,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {

                    console.log('msAndHsdSaleListByShift', response.data.data)
                    const totalamount = response.data.data.map(item => item.Sale.total_amount);
                    const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
                    setmsAndHsdSaleList(sum);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, base_url]);

    useEffect(() => {
        if (base_url && ShiftData) {
            axios
                .post(`${base_url}/getNozzleListReadings/${financialYear}`, {
                    shift: `${ShiftData.shift}`,
                    employee_id: petrodata.user_id,
                    date: ShiftData.date,
                    petro_id: petrodata.petro_id,
                    day_shift: petrodata.daily_shift,
                })
                .then((response) => {
                    const totalamount = response.data.data.map(item => item.ShiftWiseNozzle.amount);
                    const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
                    settotal_sale_amount(sum);

                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        }
    }, [petrodata, base_url, ShiftData]);
    // useEffect(() => {
    //     if (petrodata && ShiftData && base_url) {
    //         axios.post(`${base_url}/msAndHsdSaleListByShift/${financialYear}`, {
    //             shift: `${ShiftData.shift}`,
    //             employee_id: petrodata.user_id,
    //             date: ShiftData.date,
    //             petro_id: petrodata.petro_id,
    //             day_shift: petrodata.daily_shift,
    //         })
    //             .then(response => {

    //                 console.log('setNoozleData', response.data.data)
    //                 const totalamount = response.data.data.map(item => item.Sale.total_amount);
    //                 const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
    //                 setNoozleData(sum);
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching data:', error);
    //             });
    //     }
    // }, [petrodata, ShiftData, base_url]);


    useEffect(() => {
        if (petrodata && ShiftData && base_url) {
            axios.post(`${base_url}/getOtherSaleListByShiftOrType/${financialYear}`, {
                shift: `${ShiftData.shift}`,
                employee_id: petrodata.user_id,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {
                    const salesData = response.data.data;

                    // Sum total_amount for sales where Ledger name is "Cash"
                    const cashSalesTotal = salesData
                        .filter(item => item.Ledger.name === 'Cash')
                        .reduce((acc, curr) => acc + curr.Sale.total_amount, 0);

                    // Sum total_amount for sales where Ledger name is not "Cash"
                    const otherSalesTotal = salesData
                        .filter(item => item.Ledger.name !== 'Cash')
                        .reduce((acc, curr) => acc + curr.Sale.total_amount, 0);

                    setCashSalesTotal(cashSalesTotal); // assuming setCashSalesTotal is a state setter
                    setOtherSalesTotal(otherSalesTotal); // assuming setOtherSalesTotal is a state setter

                    console.log('Cash Sales Total:', cashSalesTotal);
                    console.log('Other Sales Total:', otherSalesTotal);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, base_url]);


    useEffect(() => {
        if (petrodata && ShiftData && base_url) {
            axios.post(`${base_url}/expensesVoucherList/${financialYear}`, {
                shift: `${ShiftData.shift}`,
                employee_id: petrodata.user_id,
                "vid": 1,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {
                    const totalamount = response.data.data.map(item => item.Voucher.amount);
                    const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
                    setExpensesVoucherList(sum);
                    console.log('setExpensesVoucherList', response.data.data)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, base_url]);

    useEffect(() => {
        if (petrodata && ShiftData && base_url) {
            axios.post(`${base_url}/receiptVoucherList/${financialYear}`, {
                shift: `${ShiftData.shift}`,
                employee_id: petrodata.user_id,
                "vid": 0,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {
                    const totalamount = response.data.data.map(item => item.Voucher.amount);
                    const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
                    setRecieptList(sum);
                    console.log('setRecieptList', response.data.data)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, base_url]);



    useEffect(() => {
        if (petrodata && ShiftData && petrodata.daily_shift && base_url) {
            axios.post(`${base_url}/cardSaleList/${financialYear}`, {
                shift: `${ShiftData.shift}`,
                employee_id: petrodata.user_id,
                type: 1,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {
                    const totalamount = response.data.data.map(item => item.CardSale.amount);
                    const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
                    setWallet(sum);
                    console.log('setWallet', response.data.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, petrodata.daily_shift, base_url]);
    useEffect(() => {
        if (petrodata && ShiftData && petrodata.daily_shift && base_url) {
            axios.post(`${base_url}/cardSaleList/${financialYear}`, {
                shift: `${ShiftData.shift}`,
                employee_id: petrodata.user_id,
                "type": 0,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {
                    const totalamount = response.data.data.map(item => item.CardSale.amount);
                    const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
                    setCardSales(sum);
                    console.log('setWallet', response.data.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, petrodata.daily_shift, base_url]);


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



    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    const total_sale = parseFloat(total_sale_amount || 0) + parseFloat(cashSalesTotal || 0)
    const formatedtotal_sale = customFormat(parseFloat(total_sale).toFixed(2));
    const total_msAndHsdSaleList = parseFloat(msAndHsdSaleList || 0)
    const total_otherSalesTotal = parseFloat(otherSalesTotal || 0)
    const formattedtotal_msAndHsdSaleList = customFormat(total_msAndHsdSaleList.toFixed(2) || 0);
    // const formattedtotal_getOtherSaleList = customFormat(total_getOtherSaleList);
    const formattedexpensesVoucherList = customFormat(expensesVoucherList);
    const formattedrecieptList = customFormat(parseFloat(recieptList).toFixed(2));
    const formattedwalletList = customFormat(parseFloat(walletList).toFixed(2));
    const formattedcardList = customFormat(cardList);
    let cashBalance = 0;
    cashBalance = parseFloat(total_sale || 0) - parseFloat(total_msAndHsdSaleList || 0) + parseFloat(recieptList || 0) - parseFloat(expensesVoucherList || 0) - parseFloat(cardList || 0) - parseFloat(walletList || 0);

    const formatedcashBalance = customFormat(parseFloat(cashBalance).toFixed(2));

    const getTextStyle = (value) => ({
        color: value < 0 ? 'red' : 'black',
    });


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PuffLoader size={150} color={"#000000"} loading={loading} />
            </div>
        );
    }

    return (
        <div className="h-screen   flex bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 overflow-hidden bg-gray-100">
            <Navbar petrodata={petrodata} />
            <main className="flex-1 relative z-0 overflow-y-auto overflow-x-hidden  focus:outline-none">
                <h1 className='relative block  lg:hidden text-white mx-auto w-[70%] text-center top-4 text-2xl z-20'>DashBoard</h1>
                <div className='w-[90vw] lg:w-[80.5vw] bg-navbar lg:mt-5 mt-10 mx-5 fixed rounded-md px-8 py-5 '>
                    <div className="flex justify-between">
                        <h2 className="block text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                            Date: <span className='text-red-500 font-medium'>{ShiftData.date}</span>
                        </h2>
                        <h2 className="block text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">Shift: <span className='text-red-500 font-medium'>{ShiftData.day_shift_no}</span></h2>
                    </div>
                </div>
                <div className=' mx-auto w-[90%] lg:w-1/2 lg:mx-auto my- rounded border-white p-4 lg:p-5 mt-28 mb-1 lg:mt-28  bg-navbar'>
                    <h1 className='text-2xl w-full text-white mb-2 lg:hidden block text-center font-bold'>Hey, {petrodata.name}</h1>
                    <h1 className='text-xl lg:text-2xl w-full text-white  text-center font-bold'>Welcome to {petrodata.petro_name}</h1>
                </div>
                {shouldFetchAdd === true ? (

                    <div className='flex flex-col bg-white border-3 drop-shadow-2xl mt-4 border-black lg:w-1/2 lg:mx-auto rounded-lg justify-center mx-2 lg:mt-5'>
                        <div className='flex flex-col px-4 lg:px-10 w-full'>

                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                                <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Sale Amount</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(parseFloat(total_sale_amount).toFixed(2))}>₹{formatedtotal_sale}</h1>
                            </div>
                            {msAndHsdSaleList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                                <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Credit Sale</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(parseFloat(msAndHsdSaleList).toFixed(2))}>  ₹{formattedtotal_msAndHsdSaleList}</h1>
                            </div>}

                            {expensesVoucherList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                                <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Expenses</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(parseFloat(expensesVoucherList).toFixed(2))}>₹{formattedexpensesVoucherList}</h1>
                            </div>}

                            {recieptList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                                <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Receipt</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(parseFloat(recieptList).toFixed(2))}>₹{formattedrecieptList}</h1>
                            </div>}
                            {walletList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                                <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Wallet</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(parseFloat(walletList).toFixed(2))}>₹{formattedwalletList}</h1>
                            </div>}
                            {cardList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                                <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Card</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(parseFloat(cardList).toFixed(2))}>₹{formattedcardList}</h1>
                            </div>}

                            <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                                <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Cash Balance</h2>
                                <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                                <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(cashBalance)}>₹{formatedcashBalance}</h1>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-[65vh]  justify-center items-center w-full  px-4 sm:px-6 lg:px-8">
                        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10 border border-gray-300 max-w-md sm:max-w-lg lg:max-w-2xl">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-red-500 mb-4 text-center">Nozzle is not Assigned.</h1>
                            <p className="text-gray-700 text-center sm:text-lg">Please contact your administrator or try again later.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default DashBoard;
