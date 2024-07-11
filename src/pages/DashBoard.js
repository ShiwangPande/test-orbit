import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';




function DashBoard({ petrodata }) {

    const [ShiftData, setShiftData] = useState([]);
    const [msAndHsdSaleList, setmsAndHsdSaleList] = useState("");
    const base_url = process.env.REACT_APP_API_URL;
    const [getOtherSaleList, setgetOtherSaleList] = useState("");
    const [expensesVoucherList, setExpensesVoucherList] = useState([]);
    const [recieptList, setRecieptList] = useState([]);
    const [cardList, setCardSales] = useState([]);
    const [walletList, setWallet] = useState([]);
    useEffect(() => {
        if (petrodata && petrodata.user_id && petrodata.petro_id && petrodata.daily_shift && base_url) {
            axios
                .post(`${base_url}/currentShiftData/1`,
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
            axios.post(`${base_url}/msAndHsdSaleListByShift/1`, {
                shift: ShiftData.shift,
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
        if (petrodata && ShiftData && base_url) {
            axios.post(`${base_url}/getOtherSaleListByShiftOrType/1`, {
                shift: ShiftData.shift,
                employee_id: petrodata.user_id,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {
                    const totalamount = response.data.data.map(item => item.Sale.total_amount);
                    const sum = totalamount.reduce((acc, curr) => acc + curr, 0);
                    setgetOtherSaleList(sum);
                    console.log('getOtherSaleListByShiftOrType', response.data.data)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, base_url]);

    useEffect(() => {
        if (petrodata && ShiftData && base_url) {
            axios.post(`${base_url}/expensesVoucherList/1`, {
                shift: ShiftData.shift,
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
            axios.post(`${base_url}/receiptVoucherList/1`, {
                shift: ShiftData.shift,
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
            axios.post(`${base_url}/cardSaleList/1`, {
                shift: ShiftData.shift,
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
            axios.post(`${base_url}/cardSaleList/1`, {
                shift: ShiftData.shift,
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

    const total_sale = parseFloat(msAndHsdSaleList) + parseFloat(getOtherSaleList)
    const formattedtotal_sale = customFormat(total_sale);
    const formattedexpensesVoucherList = customFormat(expensesVoucherList);
    const formattedrecieptList = customFormat(recieptList);
    const formattedwalletList = customFormat(walletList);
    const formattedcardList = customFormat(cardList);
    console.log("formattedtotalAmount", formattedtotal_sale);



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
                            Date: <span className='text-red-500 font-medium'>{ShiftData.date}</span>
                        </h2>
                        <h2 className="block text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">Shift: <span className='text-red-500 font-medium'>{ShiftData.day_shift_no}</span></h2>
                    </div>
                </div>
                <div className=' mx-auto w-[90%] lg:w-1/2 lg:mx-auto my- rounded border-white p-4 lg:p-5 mt-28 mb-1 lg:mt-28  bg-navbar'>
                    <h1 className='text-2xl w-full text-white mb-2 lg:hidden block text-center font-bold'>Hey, {petrodata.name}</h1>
                    <h1 className='text-xl lg:text-2xl w-full text-white  text-center font-bold'>Welcome to {petrodata.petro_name}</h1>
                </div>
                <div className='flex flex-col bg-white border-3 drop-shadow-2xl mt-4 border-black lg:w-1/2 lg:mx-auto rounded-lg justify-center mx-2 lg:mt-5'>
                    <div className='flex flex-col px-4 lg:px-10 w-full'>

                        {formattedtotal_sale && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                            <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Sale Amount</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(total_sale)}>₹{formattedtotal_sale}</h1>
                        </div>}


                        {formattedtotal_sale && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                            <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Cash/Credit Amount</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(total_sale)}>₹{formattedtotal_sale}</h1>
                        </div>}

                        {formattedexpensesVoucherList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                            <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Expense</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(expensesVoucherList)}>₹{formattedexpensesVoucherList}</h1>
                        </div>}

                        {formattedrecieptList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                            <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Receipt</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(recieptList)}>₹{formattedrecieptList}</h1>
                        </div>}
                        {formattedwalletList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                            <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Wallet</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(walletList)}>₹{formattedwalletList}</h1>
                        </div>}
                        {formattedcardList && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                            <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Total Card</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(cardList)}>₹{formattedcardList}</h1>
                        </div>}

                        {formattedtotal_sale && <div className='grid lg:grid-cols-8 grid-cols-7 justify-between w-full gap-2 my-2 lg:my-5'>
                            <h2 className="text-gray-700 text-lg col-span-3 lg:col-span-4 lg:text-xl font-semibold">Cash Balance</h2>
                            <div className="font-bold text-xl col-span-1 lg:text-xl">:</div>
                            <h1 className="font-bold text-lg col-span-3 lg:col-span-3 text-end lg:text-xl" style={getTextStyle(total_sale)}>₹{formattedtotal_sale}</h1>
                        </div>}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashBoard;
