import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logout from "./Logout.js";
import logo from "../images/navlogo.svg"
function NoozleReading({ petrodata }) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [noozleData, setNoozleData] = useState([]);
    const [readings, setReadings] = useState({}); // State to hold closeReading and testing values
    const base_url = process.env.REACT_APP_API_URL;
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
                // Initialize readings state
                console.log(data)
                const initialReadings = {};
                data.forEach(item => {
                    initialReadings[item.NozzlesAssign.id] = {
                        closeReading: item.start_reading,
                        testing: 0,
                    };
                });
                setReadings(initialReadings);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata, base_url]);

    const handleCalculation = (startReading, closeReading, testing, rate, maxReading) => {
        // Handle wrap-around logic
        if (closeReading < startReading) {
            closeReading += maxReading;
        }
        // Convert testing to a number (default to 0 if blank or non-numeric)
        testing = parseInt(testing) || 0;
        const sale = Math.max(0, closeReading - startReading - testing);
        const amount = sale * rate;
        return { sale, amount, testing };
    };

    const handleInputChange = (id, type, value, maxReading) => {
        // Ensure closeReading and testing are within valid ranges
        if (type === 'closeReading') {
            value = Math.min(maxReading, Math.max(0, value)); // Ensure non-negative and within maxReading
        } else if (type === 'testing') {
            // Ensure testing does not exceed maxReading
            value = Math.min(maxReading, Math.max(0, value));
        }

        setReadings(prevState => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                [type]: value
            }
        }));
    };
    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
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
                <div className="flex items-center justify-start h-full">
                    <div className="bg-navbar h-full w-full p-8 flex flex-col">
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
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-2 flex gap-[3rem] flex-col mt-14 bg-navbar space-y-1">
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
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-navbar border-b border-gray-200 lg:hidden">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        type="button"
                        className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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

                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    {noozleData && noozleData.length > 0 ? (
                        noozleData.map((item) => {
                            const { closeReading, testing } = readings[item.NozzlesAssign.id] || {};
                            const { sale, amount } = handleCalculation(item.start_reading, closeReading, testing, item.rate, item.Nozzle.max_reading);

                            return (
                                <div key={item.NozzlesAssign.id} className="py-6">
                                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                                        <form className="bg-card grid grid-cols-2  gap-3 shadow-md rounded px-4 pt-6 pb-5 mb-4">
                                            {/* <div className="mb-4 flex justify-between"> */}
                                                <h2 className="block text-gray-700  text-base lg:text-lg font-bold mb-4">
                                                    Nozzle: <span className='text-red-500 font-medium'>{item.Nozzle.name}</span>
                                                </h2>
                                                <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-4">Commodity Name: <span className='text-red-500 font-medium'>{item.Nozzle.Item.name}</span></h2>
                                            {/* </div> */}
                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="start-reading">
                                                    Start Reading
                                                </label>
                                                <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                                    {item.start_reading}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="close-reading">
                                                    Close Reading
                                                </label>
                                                <input
                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                    type="number"
                                                    value={closeReading}
                                                    onChange={(e) => handleInputChange(item.NozzlesAssign.id, 'closeReading', Number(e.target.value), item.Nozzle.max_reading)}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="testing">
                                                    Testing
                                                </label>
                                                <input
                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                    type="number"
                                                    value={testing}
                                                    onChange={(e) => handleInputChange(item.NozzlesAssign.id, 'testing', Number(e.target.value), item.Nozzle.max_reading)}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="total-sale">
                                                    Total Sale
                                                </label>
                                                <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                                    {sale}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="rate">
                                                    Rate
                                                </label>
                                                <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                                    {item.rate}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="amount">
                                                    Amount
                                                </label>
                                                <div className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                                    {amount}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-6 text-center mt-[25%] text-gray-500">Loading...</div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default NoozleReading;
