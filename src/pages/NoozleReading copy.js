import React, { useState, useEffect } from 'react';
import axios from 'axios';
import add from "../images/add.svg"
const YourComponent = ({ petrodata }) => {
    const [noozleData, setNoozleData] = useState([]);
    const [readings, setReadings] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        closeReading: '',
        testing: '',
        totalSale: '',
        rate: '',
        amount: ''
    });
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
        if (closeReading < startReading) {
            closeReading += maxReading;
        }
        testing = parseInt(testing);
        const sale = Math.max(0, closeReading - startReading - testing);
        const amount = sale * rate;
        return { sale, amount };
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        // Assuming handleCalculation calculates and returns updated values
        const { closeReading, testing } = formData;
        // You can access rate from formData.rate or directly from item.rate in mapping below
        const rate = formData.rate || 0;
        const maxReading = 100; // Example maxReading initialization, update based on your logic

        // Perform any calculations or backend submissions here
        const { sale, amount } = handleCalculation(0, closeReading, testing, rate, maxReading);

        // Update formData with calculated values
        setFormData({ ...formData, totalSale: sale, amount });

        // Optionally, you can reset the form or perform other actions after submission
        // setFormData({
        //     closeReading: '',
        //     testing: '',
        //     totalSale: '',
        //     rate: '',
        //     amount: ''
        // });
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        // Optionally reset form data or perform other actions on modal close
    };

    return (
        <>
            {noozleData && noozleData.length > 0 ? (
                noozleData.map((item) => {
                    const nozzleId = item?.NozzlesAssign?.id;
                    const { closeReading, testing } = readings[nozzleId] || {};
                    const startReading = item?.start_reading || 0;
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
                                                                value={formData.closeReading}
                                                                onChange={(e) => handleInputChange('closeReading', e.target.value)}
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
                                                                value={formData.testing}
                                                                onChange={(e) => handleInputChange('testing', e.target.value)}
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
                                                                value={formData.totalSale}
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
                                                                value={rate}
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
                                                                value={formData.amount}
                                                            />
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mb-8'>
                                        <button className='bg-red-500 relative lg:left-[10%] hover:bg-red-400 mx-5 text-white p-2 rounded-lg text-lg font-semibold' onClick={handleModalClose}>Close</button>
                                        <button className="bg-gray-800 relative lg:left-[75%] hover:bg-gray-600 text-white p-2 rounded-lg text-lg font-semibold" type="submit" form="my-form">
                                            Submit
                                        </button>
                                    </div>
                                </>
                            )}
                        </React.Fragment>
                    );
                })
            ) : (
                <div className="py-6 text-center mt-[25%] text-gray-500">Loading...</div>
            )}
        </>
    );
};

export default YourComponent;
