import React, { useState, useEffect } from 'react';
import axios from 'axios';
import add from "../images/add.svg"
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import logo from "../images/navlogo.svg"
import Logout from "../components/Logout.js";

const MyComponent = ({ petrodata }) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [noozleData, setNoozleData] = useState([]);
    const [readings, setReadings] = useState({});
    const base_url = process.env.REACT_APP_API_URL;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [totalSale, setTotalSale] = useState('');
    const [rate, setRate] = useState('');
    const [amount, setAmount] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [errors, setErrors] = useState({});

    const [submittedData, setSubmittedData] = useState(() => {
        const storedData = JSON.parse(localStorage.getItem('submittedNozzleData')) || [];
        return storedData;
    });
    useEffect(() => {
        localStorage.setItem('submittedNozzleData', JSON.stringify(submittedData));
    }, [submittedData]);
    useEffect(() => {
        axios.post(
            `${base_url}/petro_cake/petroAppEmployees/assignNozzleList/1`,
            {
                "shift": 11,
                "emp_id": "24",
                "date": "2024-04-11",
                "petro_id": petrodata.petro_id,
                "day_shift": petrodata.daily_shift,
            }
        )
            .then(response => {
                const data = response.data.data;
                setNoozleData(data);
                const initialReadings = {};

                data.forEach(item => {
                    initialReadings[item.NozzlesAssign.id] = {
                        startReading: item.start_reading,
                        closeReading: item.start_reading,
                        testing: 0,
                        nozzleId: item.NozzlesAssign.id,
                        rate: item.NozzlesAssign.rate,
                        maxReading: item.NozzlesAssign.max_reading,

                    };
                });
                setReadings(initialReadings);

            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata, base_url]);
    const handleCalculation = (startReading, closeReading, testing, rate, maxReading) => {
        // Ensure all inputs are numeric
        startReading = parseFloat(startReading) || 0;
        closeReading = parseFloat(closeReading) || 0;
        testing = parseInt(testing) || 0;
        rate = parseFloat(rate) || 0;

        // Handle case where closeReading is less than startReading
        if (closeReading < startReading) {
            closeReading += maxReading;
        }

        // Calculate sale and amount
        const sale = Math.max(0, closeReading - startReading - testing);
        const amount = sale * rate;

        return { sale, amount };
    };


    const handleInputChange = (id, type, value, maxReading) => {
        value = Math.min(maxReading, Math.max(0, Number(value)));

        setReadings(prevState => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                [type]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Calculate totalSale, rate, and amount for each nozzle
        const nozzleIds = Object.keys(readings);
        const newData = nozzleIds.map(nozzleId => {
            const { startReading, closeReading, testing } = readings[nozzleId];
            const item = noozleData.find(data => data.NozzlesAssign.id === parseInt(nozzleId));
            const rate = item.rate;
            const maxReading = item.Nozzle.max_reading;

            const { sale, amount } = handleCalculation(startReading, closeReading, testing, rate, maxReading);

            return {
                nozzleName: item.Nozzle.name,
                startReading,
                closeReading,
                testing,
                sale,
                rate,
                amount,
            };
        });
        const existingData = JSON.parse(localStorage.getItem('submittedNozzleData')) || [];
        localStorage.setItem('submittedNozzleData', JSON.stringify([...existingData, newData]));


        // Update submittedData based on editingIndex or add new data
        if (editingIndex !== null && editingIndex !== undefined) {
            setSubmittedData(prevState => {
                const newState = [...prevState];
                newState[editingIndex] = { readings: newData };
                return newState;
            });
        } else {
            setSubmittedData(prevState => [
                ...prevState,
                { readings: newData },
            ]);
        }

        // Clear input fields and reset states
        setAmount('');
        setRate('');
        setTotalSale('');
        setEditingIndex(null);
        setIsEditModalOpen(false);
        setEditIndex(null);
    };




    const handleEdit = (index) => {
        console.log("Editing index:", index);
        const dataToEdit = submittedData[index];
        console.log("Data to edit:", dataToEdit);


        setEditingIndex(index);
        setIsEditModalOpen(true);
    };
    const handleDelete = (index) => {
        const newData = [...submittedData];
        newData.splice(index, 1);
        localStorage.setItem('submittedNozzleData', JSON.stringify(newData));
        setSubmittedData(newData);
    };
    const controls = useAnimation();

    useEffect(() => {
        if (showMobileMenu) {
            controls.start({ x: 0 });
        } else {
            controls.start({ x: '-80vw' });
        }
    }, [showMobileMenu, controls]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x < -50) {
            setShowMobileMenu(false);
        } else if (info.offset.x > 50) {
            setShowMobileMenu(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest('.navbar') === null) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileMenu]);


    return (
        <div className="h-screen flex bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 overflow-hidden bg-gray-100">
            <div className="hidden lg:fixed h-screen md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="h-0 flex-1 flex flex-col pt-10 pb-4 overflow-y-auto bg-navbar">
                        {/* Sidebar Links */}
                        <div className="flex items-center flex-shrink-0 px-4">
                            <img
                                className="h-10 mx-auto w-auto "
                                src={logo}
                                alt="Your Company"
                            />
                        </div>
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-4 flex flex-col gap-10 mt-7 bg-navbar space-y-1">
                                <Link
                                    to="/noozle-reading"
                                    className="bg-wheat text-black block rounded-md px-3 py-2 text-md font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Receipt
                                </Link>
                                <div className='px-3 '>
                                    <Logout />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-0 z-40 ${showMobileMenu ? 'block' : 'hidden'}`}>
                <div className="flex items-center justify-start h-full backdrop-blur-sm">
                    <motion.div
                        className={`bg-navbar h-full fixed w-[80vw] p-8 flex flex-col navbar`}
                        initial={{ x: '-80vw' }}
                        animate={controls}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        style={{ cursor: 'grab', left: 0 }}
                    >
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                type="button"
                                className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
                                aria-controls="mobile-menu"
                                aria-expanded={showMobileMenu ? 'true' : 'false'}
                            >
                                <span className="sr-only">Close main menu</span>
                                {/* Close Icon */}
                                <svg
                                    className={`h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-2 flex-1 flex flex-col">
                            <nav className="flex-1 px-2 flex gap-[3rem] flex-col mt-8 bg-navbar space-y-1">
                                <div className="flex items-center flex-shrink-0 px-4">
                                    <img
                                        className="h-10 mx-auto w-auto "
                                        src={logo}
                                        alt="Your Company"
                                    />
                                </div>
                                <Link
                                    to="/noozle-reading"
                                    className="bg-wheat text-black block rounded-md px-3 py-2 text-lg font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Receipt
                                </Link>
                                <div className='px-3'>
                                    <Logout />
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content area */}
            <div className="flex flex-col ml-0 lg:ml-[17%] w-0 flex-1 overflow-hidden">
                <div className="w-screen z-10 flex-shrink-0  fixed flex h-16 bg-navbar border-b border-gray-200 lg:hidden">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        type="button"
                        className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md focus:outline-none focus:white focus:ring-inset focus:white"
                        aria-controls="mobile-menu"
                        aria-expanded={showMobileMenu ? 'true' : 'false'}
                    >
                        <span className="sr-only">Open main menu</span>
                        {/* Hamburger Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? 'hidden' : 'block'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        {/* Close Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? 'block' : 'hidden'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <main className="flex-1 pt-10 relative z-0 overflow-y-auto focus:outline-none">
                    {isEditModalOpen && (
                        <div className="flex flex-row justify-between items-center px-4 max-w-96 mx-auto rounded-lg lg:max-w-5xl lg:px-8 p-5  bg-navbar text-white gap-1">
                            <div className='text-2xl'>Add Nozzle Reading</div>
                            <div>
                                <button className='w-10 h-10 p-2 bg-navbar border-2 border-navbar hover:border-white hover:bg-white rounded-full' onClick={() => setIsEditModalOpen(false)} >
                                    <div className='mx-auto w-7 h-7'>
                                        <svg fill='#383838' height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xmlSpace="preserve">
                                            <g>
                                                <g>
                                                    <polygon points="512,59.076 452.922,0 256,196.922 59.076,0 0,59.076 196.922,256 0,452.922 59.076,512 256,315.076 452.922,512 512,452.922 315.076,256" />
                                                </g>
                                            </g>
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                    {noozleData && noozleData.length > 0 ? (
                        noozleData.map((item) => {
                            const nozzleId = item?.NozzlesAssign?.id;
                            const { closeReading, startReading, testing } = readings[nozzleId] || {};
                            // const startReading = item?.start_reading || 0;
                            const rate = item?.rate || 0;
                            const maxReading = item?.Nozzle?.max_reading || 0;
                            const { sale, amount } = handleCalculation(startReading, closeReading, testing, rate, maxReading);

                            return (
                                <React.Fragment key={item.NozzlesAssign.id}>
                                    {!isEditModalOpen && (
                                        <div className="flex flex-wrap gap-3">
                                            <button className="bg-navbar fixed w-16 max-w-none min-w-16 h-16 border-2 p-0 border-white right-0 bottom-0 m-5 rounded-full hover:invert text-white" onClick={() => setIsEditModalOpen(true)}>
                                                <img src={add} className="w-14 h-14 p-3" alt="" />
                                            </button>
                                        </div>
                                    )}
                                    {isEditModalOpen && (
                                        <>
                                            <div>
                                                <div className="px-4 lg:px-8">
                                                    <div className="py-6">
                                                        <div className="max-w-96 lg:max-w-5xl mx-auto sm:px-6 lg:px-8">
                                                            <form id="my-form" onSubmit={handleSubmit} className="bg-card grid grid-cols-2 gap-2 lg:gap-5 lg:px-10 lg:py-14 shadow-md rounded px-4 pt-6 pb-5 lg:mb-2">
                                                                <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">
                                                                    Nozzle: <span className='text-red-500 font-medium'>{item.Nozzle.name}</span>
                                                                </h2>
                                                                <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">Commodity Name: <span className='text-red-500 font-medium'>{item.Nozzle.Item.name}</span></h2>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="start-reading">
                                                                        Start Reading
                                                                    </label>
                                                                    <input
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        readOnly
                                                                        value={startReading}
                                                                        onChange={(e) => handleInputChange('startReading', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="close-reading">
                                                                        Close Reading
                                                                    </label>
                                                                    <input
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={closeReading}
                                                                        onChange={(e) => handleInputChange(item.NozzlesAssign.id, 'closeReading', e.target.value, item.Nozzle.max_reading)}
                                                                        // onChange={(e) =>}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="testing">
                                                                        Testing
                                                                    </label>
                                                                    <input
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={testing}
                                                                        onChange={(e) => handleInputChange(item.NozzlesAssign.id, 'testing', e.target.value, item.Nozzle.max_reading)}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="total-sale">
                                                                        Total Sale
                                                                    </label>
                                                                    <input
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        readOnly
                                                                        value={sale}
                                                                        onChange={(e) => handleInputChange('totalSale', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="rate">
                                                                        Rate
                                                                    </label>
                                                                    <input
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        readOnly
                                                                        value={item.rate}
                                                                        onChange={(e) => handleInputChange('rate', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="amount">
                                                                        Amount
                                                                    </label>
                                                                    <input
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        readOnly
                                                                        value={amount}
                                                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                                                    />
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <div className="py-6 text-center mt-[25%] text-gray-500">Loading...</div>
                    )}
                    {isEditModalOpen && (
                        <div className='mb-8'>
                            <button className='bg-red-500  relative lg:left-[10%] hover:bg-red-400 mx-5 text-white p-2 rounded-lg text-lg font-semibold' onClick={() => setIsEditModalOpen(false)}>Close</button>
                            <button className="bg-gray-800 relative lg:left-[75%] hover:bg-gray-600 text-white p-2 rounded-lg text-lg font-semibold" type="submit" form="my-form">
                                Submit
                            </button>
                        </div>
                    )}
                    {!isEditModalOpen && (
                        <>
                            <h2 className="text-2xl font-semibold mt-6 mb-4">Submitted Data</h2>
                            <div className='m-5 grid grid-cols-1 lg:mt-7 lg:grid-cols-2 gap-3 lg:gap-10'>

                                {submittedData.length > 0 ? (
                                    submittedData.map((data, index) => (
                                        <div key={index} className='bg-white border flex justify-around flex-col border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'>

                                            <div className="flex justify-around min-h-max	lg:max-w-3xl max-w-sm lg:p-3 p-2   ">
                                                {data && data.readings && Object.entries(data.readings).map(([nozzleId, reading]) => (
                                                    <div key={nozzleId} className='lg:my-2 my-1 grid grid-cols-1 lg:grid-cols-1 lg:gap-2 gap-1 lg:text-lg text-xs'>
                                                        {reading.nozzleName && <p className="text-orrange  font-semibold">{reading.nozzleName}</p>}
                                                        {reading.startReading !== 0 && <p className="text-gray-700 font-semibold">Start reading: {reading.startReading}</p>}
                                                        {reading.closeReading !== 0 && <p className="text-gray-700 font-semibold">Closing Reading: {reading.closeReading}</p>}
                                                        {reading.testing !== 0 && <p className="text-gray-700 font-semibold">Testing: {reading.testing}</p>}
                                                        {reading.sale !== 0 && <p className="text-gray-700 font-semibold">Total Sale: {reading.sale}</p>}
                                                        {reading.rate !== 0 && <p className="text-gray-700 font-semibold">Rate: {reading.rate}</p>}
                                                        {reading.amount !== 0 && <p className="text-gray-700 font-semibold">Amount: {reading.amount}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-row justify-around my-5">
                                                <button className="px-2 w-10 h-10" color="primary" onClick={() => handleEdit(index)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                        <path d="M20.548 3.452a1.542 1.542 0 0 1 0 2.182l-7.636 7.636-3.273 1.091 1.091-3.273 7.636-7.636a1.542 1.542 0 0 1 2.182 0zM4 21h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-2 0v7H5V6h7a1 1 0 0 0 0-2H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z" fill="#000" />
                                                    </svg>
                                                </button>
                                                <button className="px-2 w-10 h-10" onClick={() => handleDelete(index)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                        <path d="M5.755 20.283 4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z" fill="#F44336" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No data available</p>
                                )}

                            </div>
                        </>
                    )}
                </main>
            </div >
        </div >
    );
};

export default MyComponent;
