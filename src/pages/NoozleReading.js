import React, { useState, useEffect } from 'react';
import axios from 'axios';
import add from "../images/add.svg"

import Navbar from '../components/Navbar';

const NoozleReading = ({ petrodata }) => {
    const [noozleData, setNoozleData] = useState([]);
    const [readings, setReadings] = useState({});
    const base_url = process.env.REACT_APP_API_URL;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [totalSale, setTotalSale] = useState('');
    const [amount, setAmount] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const [isDataAdded, setIsDataAdded] = useState(false); // New state variable
    const [shiftdata, setShiftdata] = useState([]);
    const [submittedData, setSubmittedData] = useState(() => {
        const storedData = JSON.parse(localStorage.getItem('submittedNozzleData')) || [];
        return storedData;
    });
    // Initialize submittedData from localStorage
    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('submittedNozzleData')) || [];
        setSubmittedData(storedData);
    }, []);
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        localStorage.setItem('submittedNozzleData', JSON.stringify(submittedData));
        if (submittedData.length > 0) {
            setIsDataAdded(true);
        }
    }, [submittedData]);


    const handleCalculation = (startReading, closeReading, testing, rate, maxReading) => {
        startReading = parseFloat(startReading) || 0;
        closeReading = parseFloat(closeReading) || 0;
        testing = parseInt(testing) || 0;
        rate = parseFloat(rate) || 0;

        if (closeReading < startReading) {
            closeReading += maxReading;
        }

        const sale = Math.max(0, closeReading - startReading - testing);
        const amount = (sale * rate).toFixed(2); // Ensures amount has two decimal places

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


    const validateForm = () => {
        const newErrors = {};
        Object.keys(readings).forEach(id => {
            if (readings[id].closeReading === undefined || readings[id].closeReading === null || readings[id].closeReading === '' || readings[id].closeReading === 0) {
                newErrors[id] = 'Close reading cannot be empty';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const nozzleIds = Object.keys(readings);
        const newData = nozzleIds.map(nozzleId => {
            const { startReading, closeReading, testing } = readings[nozzleId];
            const item = noozleData.find(data => data.NozzlesAssign.id === parseInt(nozzleId));

            if (!item) {
                // Handle the case where item is not found
                console.error(`No item found for nozzleId ${nozzleId}`);
                return null; // or handle in some appropriate way
            }

            const rate = item.rate;
            const maxReading = item.Nozzle.max_reading;

            const { sale, amount } = handleCalculation(startReading, closeReading, testing, rate, maxReading);

            return {
                nozzleId, // Ensure nozzleId is included here
                nozzleName: item.Nozzle.name,
                startReading,
                closeReading,
                testing,
                sale,
                rate,
                amount,
                maxReading
            };
        });

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
            setIsDataAdded(true); // Set isDataAdded to true on first submit
        }

        // Reset form inputs and modal state
        setReadings({});
        setAmount('');
        setTotalSale('');
        setEditingIndex(null);
        setIsEditModalOpen(false);
        setEditIndex(null);
    };


    useEffect(() => {
        axios
            .post(`${base_url}/currentShiftData/1`,
                {

                    petro_id: petrodata.petro_id,
                })
            .then((response) => {
                const { shift, day_shift_no, date } = response.data.data.DailyShift;
                const formattedDate = formatDate(date);
                setShiftdata({ shift, day_shift_no, formattedDate, date });
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [petrodata, base_url]);


    const handleEdit = (index) => {
        const dataToEdit = submittedData[index];
        console.log('Data to Edit:', dataToEdit); // Debugging

        // Prepare initial readings state for editing
        const initialReadings = {};
        dataToEdit.readings.forEach(reading => {
            console.log('Reading:', reading); // Debugging
            const nozzleId = reading.nozzleId; // Ensure this correctly accesses the nozzleId
            if (nozzleId !== undefined) {
                initialReadings[nozzleId] = {
                    startReading: reading.startReading,
                    closeReading: reading.closeReading,
                    testing: reading.testing,
                    nozzleId: nozzleId, // Make sure nozzleId is assigned correctly
                    rate: reading.rate,
                    nozzleName: reading.nozzleName,
                    maxReading: reading.maxReading || 0, // Provide a default value if necessary
                };
            } else {
                console.error('Nozzle ID is undefined for reading:', reading); // Debugging
            }
        });

        console.log('Initial readings:', initialReadings); // Check console for initialReadings

        setReadings(initialReadings);
        setEditingIndex(index);
        setIsEditModalOpen(true);
    };






    useEffect(() => {
        axios.post(
            `${base_url}/assignNozzleList/1`,
            {
                "shift": `${shiftdata.shift}`,
                "emp_id": petrodata.user_id,
                "date": shiftdata.date,
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
                        rate: item.rate,
                        maxReading: item.Nozzle.max_reading,
                    };
                });
                setReadings(initialReadings); // Set readings state
                console.log('initial', initialReadings)
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata, base_url, shiftdata]);




    const handleDelete = (index) => {
        const newData = [...submittedData];
        newData.splice(index, 1);
        localStorage.setItem('submittedNozzleData', JSON.stringify(newData));
        setSubmittedData(newData);
    };

    return (
        <div className="h-full min-h-screen flex bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 overflow-hidden bg-gray-100">
            <Navbar petrodata={petrodata} />
            <main className="flex-1 overflow-x-hidden focus:outline-none">

                <div className=' relative z-0 overflow-x-hidden overflow-y-auto'>

                    {isEditModalOpen && (
                        <div className="flex flex-row justify-between mt-20 lg:mt-5  items-center px-4 max-w-96 mx-auto rounded-md lg:rounded-lg lg:max-w-5xl lg:px-8 p-4  bg-navbar text-white gap-1">
                            <div className='text-xl lg:text-2xl'>Add Nozzle Reading</div>
                            <div>
                                <button className='lg:w-10 w-6 h-6 lg:h-10 p-0 lg:p-2 bg-navbar border-2 border-navbar hover:border-white hover:bg-white rounded-full' onClick={() => setIsEditModalOpen(false)} >
                                    <div className='mx-auto lg:w-5 h-5 w-5 lg:h-5'>
                                        <svg fill='#383838' version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xmlSpace="preserve">
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
                    {noozleData && (
                        noozleData.map((item) => {
                            const nozzleId = item?.NozzlesAssign.id;
                            const { closeReading, startReading, testing } = readings[nozzleId] || {};
                            const rate = item?.rate || 0;


                            const maxReading = item?.Nozzle?.max_reading || 0;
                            const { sale, amount } = handleCalculation(startReading, closeReading, testing, rate, maxReading);

                            return (
                                <React.Fragment key={item.NozzlesAssign.id}>
                                    {!isEditModalOpen && !isDataAdded && (
                                        <div className="flex flex-wrap gap-3">
                                            <button className="bg-navbar fixed w-16 max-w-none min-w-16 h-16 border-2 p-0 border-white right-0 bottom-0 m-5 rounded-full hover:invert text-white" onClick={() => setIsEditModalOpen(true)}>
                                                <img src={add} className="w-14 h-14 m-auto  p-3" alt="" />
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

                                                                <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-0 lg:mb-2">
                                                                    Date: <span className='text-red-500 font-medium'>        {shiftdata.formattedDate}</span>
                                                                </h2>
                                                                <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">  Shift: <span className='text-red-500 font-medium'>  {shiftdata.day_shift_no}</span></h2>

                                                                <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">
                                                                    Nozzle: <span className='text-red-500 font-medium'>{item.Nozzle.name}</span>
                                                                </h2>
                                                                <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">Commodity: <span className='text-red-500  font-medium'>{item.Nozzle.Item.name}</span></h2>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="start-reading">
                                                                        Start Reading
                                                                    </label>
                                                                    <input autoComplete="off"
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={readings[item.NozzlesAssign.id]?.startReading || ''}
                                                                        onChange={(e) => handleInputChange(item.NozzlesAssign.id, 'startReading', e.target.value, item.Nozzle.max_reading)}
                                                                    />

                                                                    {errors.startReading && <div className="text-red-500">{errors.startReading}</div>}
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="close-reading">
                                                                        Close Reading
                                                                    </label>

                                                                    <input autoComplete="off"
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={readings[item.NozzlesAssign.id]?.closeReading || ''}
                                                                        onChange={(e) => handleInputChange(item.NozzlesAssign.id, 'closeReading', e.target.value, item.Nozzle.max_reading)}
                                                                    />
                                                                    {errors[nozzleId] && (
                                                                        <span className="text-red-500 text-sm">{errors[nozzleId]}</span>
                                                                    )}
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="testing">
                                                                        Testing
                                                                    </label>

                                                                    <input autoComplete="off"
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={readings[item.NozzlesAssign.id]?.testing || ''}
                                                                        onChange={(e) => handleInputChange(item.NozzlesAssign.id, 'testing', e.target.value, item.Nozzle.max_reading)}
                                                                    />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="total-sale">
                                                                        Sale
                                                                    </label>
                                                                    <input autoComplete="off"
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={sale}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="rate">
                                                                        Rate
                                                                    </label>
                                                                    <input autoComplete="off"
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={rate}
                                                                        readOnly
                                                                    />
                                                                </div>

                                                                <div className="mb-2">
                                                                    <label className="block text-gray-700 text-md font-bold mb-2" htmlFor="amount">
                                                                        Amount
                                                                    </label>
                                                                    <input autoComplete="off"
                                                                        className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        type="number"
                                                                        value={amount}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                {isEditModalOpen && (
                                                                    <div className="col-span-2 text-center mt-4">
                                                                        <button type="submit" className="bg-navbar text-white py-2 px-4 rounded hover:invert">
                                                                            {editingIndex !== null && editingIndex !== undefined ? 'Update' : 'Submit'}
                                                                        </button>
                                                                    </div>
                                                                )}
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

                    )}
                    {!isEditModalOpen && (
                        <div className='w-[90vw]  lg:w-[80.5vw] bg-navbar lg:fixed relative lg:mt-5 mt-16 mx-5  rounded-md px-8 py-5 '><div className="  flex justify-between">


                            <h2 className="block    text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                                Date: <span className='text-red-500 font-medium'>        {shiftdata.formattedDate}</span>
                            </h2>
                            <h2 className="block   text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">  Shift: <span className='text-red-500 font-medium'>  {shiftdata.day_shift_no}</span></h2>
                        </div>
                        </div>
                    )}
                    {!isEditModalOpen && (
                        <div className="flex justify-center items-center flex-col w-full h-[80vh] lg:h-screen gap-2 py-2">
                            {submittedData && submittedData.map((data, index) => (
                                <div key={index} className="bg-white mx-auto my-auto mt-10 lg:my-auto flex rounded-lg flex-col gap-8 justify-center w-4/5 lg:w-1/2 h-fit p-4 shadow">
                                    <div className='flex flex-col lg:flex-row select-none justify-around mt-5 gap-5 h-full w-full'>
                                        {data.readings.map((reading, i) => (

                                            <div key={i} className='flex flex-col gap-3 lg:gap-3 border border-black p-3 lg:p-8 rounded-lg lg:text-lg text-lg'>
                                                {reading.nozzleName !== null && <h3 className="text-orrange text-lg  font-semibold">Nozzle: {reading.nozzleName}</h3>}
                                                {reading.startReading !== 0 && <p className="text-gray-700  font-semibold">Start Reading: {reading.startReading}</p>}
                                                {reading.closeReading !== 0 && <p className="text-gray-700 font-semibold">Close Reading: {reading.closeReading}</p>}
                                                {reading.testing !== 0 && <p className="text-gray-700 font-semibold">Testing: {reading.testing}</p>}
                                                {reading.sale !== 0 && <p className="text-gray-700 font-semibold">Sale: {reading.sale}</p>}
                                                {reading.rate !== 0 && <p className="text-gray-700 font-semibold">Rate: {reading.rate}</p>}
                                                {reading.amount !== 0 && <p className="text-gray-700 font-semibold">Amount: {reading.amount}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    <button className='mx-auto bg-navbar flex justify-center w-1/3 rounded-xl' onClick={() => handleEdit(index)}>
                                        {/* <button onClick={() => handleEdit(index)} className="bg-blue-500 text-white py-1 px-2 rounded mt-2">Edit</button> */}
                                        <div className=''>
                                            <div className="px-2 invert flex it w-10 h-10" color="primary" >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                    <path d="M20.548 3.452a1.542 1.542 0 0 1 0 2.182l-7.636 7.636-3.273 1.091 1.091-3.273 7.636-7.636a1.542 1.542 0 0 1 2.182 0zM4 21h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-2 0v7H5V6h7a1 1 0 0 0 0-2H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z" fill="#000" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                    {/* <button onClick={() => handleDelete(index)} className="bg-red-500 text-white py-1 px-2 rounded mt-2 ml-2">Delete</button> */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NoozleReading;