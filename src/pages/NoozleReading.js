import React, { useState, useEffect } from "react";
import axios from "axios";
import add from "../images/add.svg";
import { PuffLoader } from "react-spinners";
import Navbar from "../components/Navbar";

const NoozleReading = ({ petrodata, financialYear }) => {
    const [noozleData, setNoozleData] = useState([]);
    const [nozzleListReadings, setNozzleListReadings] = useState([]);
    const [readings, setReadings] = useState({});
    const [editreadings, setEditReadings] = useState({});
    const base_url = process.env.REACT_APP_API_URL;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [totalSale, setTotalSale] = useState("");
    const [amount, setAmount] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [shouldFetchAdd, setShouldFetchAdd] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});
    const [shouldFetchReadings, setShouldFetchReadings] = useState(false);
    const [shiftdata, setShiftdata] = useState([]);

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleCalculation = (
        startReading,
        closeReading,
        testing,
        rate,
        maxReading
    ) => {
        startReading = parseFloat(startReading);
        closeReading = parseFloat(closeReading);
        testing = parseFloat(testing);
        rate = parseFloat(rate);

        if (closeReading < startReading) {
            closeReading += maxReading;
        }

        const sale = (Math.max(0, parseFloat(closeReading) - parseFloat(startReading) - parseFloat(testing))).toFixed(2);
        const amount = (sale * rate).toFixed(2);

        return { sale, amount };
    };
    const handleEditCalculation = (
        startReading,
        closeReading,
        testing,
        rate,
        maxReading
    ) => {
        startReading = parseFloat(startReading);
        closeReading = parseFloat(closeReading);
        testing = parseFloat(testing);
        rate = parseFloat(rate);

        if (closeReading < startReading) {
            closeReading += maxReading;
        }


        const sale = (Math.max(0, parseFloat(closeReading) - parseFloat(startReading) - parseFloat(testing))).toFixed(2);
        const amount = (sale * rate).toFixed(2);

        return { sale, amount };
    };

    const handleInputChange = (nozzleId, field, value, maxReading) => {
        // Parse the value to ensure it's numeric
        let parsedValue = parseFloat(value);

        // Treat blank "testing" value as 0
        if (field === "testing" && (value === "" || isNaN(parsedValue))) {
            parsedValue = 0;
        }
        if (field === "closeReading" && (value === "" || isNaN(parsedValue))) {
            parsedValue = 0;
        }

        // Validate and adjust the input value based on the field
        if ((field === "closeReading" || field === "testing") && parsedValue > maxReading) {
            parsedValue = maxReading;
        }

        // Update the editReadings state
        setReadings((prevReadings) => ({
            ...prevReadings,
            [nozzleId]: {
                ...prevReadings[nozzleId],
                [field]: parsedValue
            }
        }));

        // Clear any previous error for the field
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: null
        }));

        // Additional specific validation for startReading, closeReading, and testing
        if ((field === "startReading" || field === "closeReading" || field === "testing") && (parsedValue < 0 || parsedValue > maxReading)) {
            const errorMessage = `${field === "startReading" ? "Start" : field === "closeReading" ? "Close" : "Testing"} reading is out of range`;
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: errorMessage
            }));
        }
    };




    const handleEditInputChange = (nozzleId, field, value, maxReading) => {
        // Parse the value to ensure it's numeric
        let parsedValue = parseFloat(value);

        // Treat blank "testing" value as 0
        if (field === "testing" && (value === "" || isNaN(parsedValue))) {
            parsedValue = 0;
        }
        if (field === "closeReading" && (value === "" || isNaN(parsedValue))) {
            parsedValue = 0;
        }

        // Validate and adjust the input value based on the field
        if ((field === "closeReading" || field === "testing") && parsedValue > maxReading) {
            parsedValue = maxReading;
        }

        // Update the editReadings state
        setEditReadings((prevReadings) => ({
            ...prevReadings,
            [nozzleId]: {
                ...prevReadings[nozzleId],
                [field]: parsedValue
            }
        }));

        // Clear any previous error for the field
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: null
        }));

        // Additional specific validation for startReading, closeReading, and testing
        if ((field === "startReading" || field === "closeReading" || field === "testing") && (parsedValue < 0 || parsedValue > maxReading)) {
            const errorMessage = `${field === "startReading" ? "Start" : field === "closeReading" ? "Close" : "Testing"} reading is out of range`;
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: errorMessage
            }));
        }
    };






    const validateForm = () => {
        const newErrors = {};
        Object.keys(readings).forEach((id) => {
            if (
                readings[id].closeReading === undefined ||
                readings[id].closeReading === null ||
                readings[id].closeReading === "" ||
                readings[id].closeReading === 0
            ) {
                newErrors[id] = "Close reading cannot be empty";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (petrodata && base_url) {
            setLoading(true); // Start loading

            console.log("Fetching current shift data...");
            axios.post(`${base_url}/currentShiftData/${financialYear}`, {
                petro_id: petrodata.petro_id,
            })
                .then((response) => {
                    console.log("Current shift data response:", response);
                    const { shift, day_shift_no, date } = response.data.data.DailyShift;
                    const formattedDate = formatDate(date);
                    setShiftdata({ shift, day_shift_no, formattedDate, date });

                    console.log("Fetching nozzle list data...");
                    return axios.post(`${base_url}/assignNozzleList/${financialYear}`, {
                        shift: shift,
                        emp_id: petrodata.user_id,
                        date: date,
                        petro_id: petrodata.petro_id,
                        day_shift: petrodata.daily_shift,
                    });
                })
                .then((response) => {
                    console.log("Assign nozzle list response:", response);
                    if (response.status === 200 && response.data.status === 200) {
                        const data = response.data.data;
                        if (data && Array.isArray(data)) {
                            const initialReadings = {};
                            let allReadingsPresent = true;

                            data.forEach((item) => {
                                if (item.reading_id === "") {
                                    allReadingsPresent = false;
                                }
                                initialReadings[item.NozzlesAssign.nozzle_id] = {
                                    startReading: item.start_reading,
                                    closeReading: item.start_reading,
                                    testing: 0,
                                    commodityId: item.Nozzle.commodity,
                                    nozzleId: item.NozzlesAssign.nozzle_id,
                                    rate: item.rate,
                                    maxReading: item.Nozzle.max_reading,
                                };
                            });
                            setNoozleData(data);
                            setReadings(initialReadings);
                            setShouldFetchReadings(allReadingsPresent);
                            setShouldFetchAdd(true);
                        } else {
                            console.error("Invalid data format received from API:", data);
                            setShouldFetchReadings(false);
                            setShouldFetchAdd(false);
                        }
                    } else {
                        console.error("Unexpected API response:", response.data);
                        setShouldFetchReadings(false);
                        setShouldFetchAdd(false);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching nozzle list data:", error);
                    setShouldFetchReadings(false);
                    setShouldFetchAdd(false);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        }
    }, [petrodata, base_url]);



    useEffect(() => {
        if (base_url && shiftdata && shouldFetchReadings) {
            axios
                .post(`${base_url}/getNozzleListReadings/${financialYear}`, {
                    shift: `${shiftdata.shift}`,
                    employee_id: petrodata.user_id,
                    date: shiftdata.date,
                    petro_id: petrodata.petro_id,
                    day_shift: petrodata.daily_shift,
                })
                .then((response) => {
                    const data = response.data.data;
                    setNozzleListReadings(data);

                    const initialReadings = {};
                    data.forEach((item) => {
                        const nozzleId = item.ShiftWiseNozzle.nozzle_id;
                        initialReadings[nozzleId] = {
                            startReading: parseFloat(item.ShiftWiseNozzle.start_reading) || 0,
                            closeReading: parseFloat(item.ShiftWiseNozzle.closing_reading) || 0,
                            testing: parseFloat(item.ShiftWiseNozzle.testing) || 0,
                            rate: parseFloat(item.ShiftWiseNozzle.rate) || 0,
                            amount: item.ShiftWiseNozzle.amount,
                            total_sale: item.ShiftWiseNozzle.total_sale,
                            maxReading: item.Nozzle.max_reading
                        };
                    });
                    setEditReadings(initialReadings); // Set readings state
                    console.log("updateinitial", initialReadings);
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        }
    }, [petrodata, base_url, shiftdata, shouldFetchReadings]);


    useEffect(() => {
        if (nozzleListReadings) {
            const initialReadings = nozzleListReadings.reduce((acc, item) => {
                const nozzleId = item?.ShiftWiseNozzle?.nozzle_id;
                acc[nozzleId] = {
                    startReading: item?.ShiftWiseNozzle?.start_reading,
                    closeReading: item?.ShiftWiseNozzle?.closing_reading,
                    testing: item?.ShiftWiseNozzle?.testing,
                    total_sale: item?.ShiftWiseNozzle?.total_sale,
                    amount: item?.ShiftWiseNozzle?.amount,
                };
                return acc;
            }, {});
            setEditReadings(initialReadings);
        }
    }, [nozzleListReadings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const nozzleIds = Object.keys(readings);
        let nozzleListEntries = [];

        try {
            for (let i = 0; i < nozzleIds.length; i++) {
                const nozzleId = nozzleIds[i];
                const { startReading, closeReading, testing } = readings[nozzleId];
                const item = noozleData.find(
                    (data) => data.NozzlesAssign.nozzle_id === parseFloat(nozzleId)
                );

                if (!item) {
                    console.error(`No item found for nozzleId ${nozzleId}`);
                    continue;
                }

                const rate = item.rate;
                const maxReading = item.Nozzle.max_reading;

                const { sale, amount } = handleCalculation(
                    startReading,
                    closeReading,
                    testing,
                    rate,
                    maxReading
                );

                const commodityId = item.Nozzle.commodity;
                const nozzle_id = item.NozzlesAssign.nozzle_id;
                nozzleListEntries.push({
                    nozzle_id: nozzle_id,
                    commodity_id: commodityId,
                    start_reading: startReading,
                    close_reading: closeReading,
                    testing: parseFloat(testing),
                    total_sale: sale,
                    rate: rate,
                    amount: parseFloat(amount),
                });
            }

            const payload = {
                date: shiftdata.date,
                shift: shiftdata.shift,
                day_shift: shiftdata.day_shift_no,
                petro_id: petrodata.petro_id,
                employee_id: petrodata.user_id,
                nozzleListEntry: nozzleListEntries,
            };

            console.log("payload", payload);
            if (petrodata && shiftdata && base_url) {
                await axios.post(
                    `${base_url}/addShiftWiseNozzleReadingEntry_Reg/${financialYear}`,
                    payload
                );
                console.log("Data submitted successfully.");
                const response = await axios.post(`${base_url}/getNozzleListReadings/${financialYear}`, {
                    shift: shiftdata.shift,
                    employee_id: petrodata.user_id,
                    date: shiftdata.date,
                    petro_id: petrodata.petro_id,
                    day_shift: shiftdata.day_shift_no,
                });

                const data = response.data.data;
                setNozzleListReadings(data);

                const initialReadings = {};
                data.forEach((item) => {
                    if (item?.ShiftWiseNozzle) {
                        initialReadings[item.ShiftWiseNozzle.nozzle_id] = {
                            startReading: parseFloat(item.ShiftWiseNozzle.start_reading) || 0,
                            closeReading: parseFloat(item.ShiftWiseNozzle.closing_reading) || 0,
                            testing: parseFloat(item.ShiftWiseNozzle.testing) || 0,
                            rate: parseFloat(item.ShiftWiseNozzle.rate) || 0,
                            amount: item.ShiftWiseNozzle.amount,
                            total_sale: item.ShiftWiseNozzle.total_sale,
                            maxReading: item.Nozzle.max_reading
                        };
                    }
                });

                setEditReadings(initialReadings);
                console.log("initial", initialReadings);

                setEditingIndex(null);
                setIsEditModalOpen(false);
                setEditingIndex(null);
                setEditIndex(null);
                setShouldFetchReadings(true);
                console.log("Form submitted successfully");
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            }
        }
    };

    useEffect(() => {
        if (base_url && petrodata) {
            axios
                .post(`${base_url}/currentShiftData/${financialYear}`, {
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
        }
    }, [petrodata, base_url]);



    const validateEditForm = () => {
        const newErrors = {};
        Object.keys(editreadings).forEach((id) => {
            if (
                editreadings[id].closeReading === undefined ||
                editreadings[id].closeReading === null ||
                editreadings[id].closeReading === "" ||
                editreadings[id].closeReading === 0
            ) {
                newErrors[id] = "Close reading cannot be empty";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!validateEditForm()) {
            return;
        }

        const nozzleIds = Object.keys(editreadings);
        let nozzleListEntries = [];

        try {
            console.log("noozleData:", noozleData);
            console.log("editreadings:", editreadings);
            console.log("nozzleIds:", nozzleIds);

            nozzleIds.forEach((nozzleId) => {
                const { startReading, closeReading, testing } = editreadings[nozzleId];
                const item = nozzleListReadings.find(data => data.ShiftWiseNozzle.nozzle_id === parseFloat(nozzleId));
                const nozzleitem = noozleData.find(data => data.NozzlesAssign.nozzle_id === parseFloat(nozzleId));

                console.log(`Processing nozzleId: ${nozzleId}`);
                console.log("item:", item);
                console.log("nozzleitem:", nozzleitem);

                if (!item) {
                    console.error(`No item found for nozzleId ${nozzleId}`);
                    return;
                }

                if (!nozzleitem) {
                    console.error(`No nozzleitem found for nozzleId ${nozzleId}`);
                    return;
                }

                if (!nozzleitem.Nozzle) {
                    console.error(`No Nozzle object found for nozzleitem with nozzleId ${nozzleId}`);
                    return;
                }

                const readingId = item.ShiftWiseNozzle.id;
                const commodityId = item.Item.id;
                const nozzle_id = item.ShiftWiseNozzle.nozzle_id;
                const tankId = nozzleitem.Nozzle.tank_id;
                const dsmIds = nozzleitem.NozzlesAssign.dsm_id;

                nozzleListEntries.push({
                    nozzle_red_id: readingId,
                    dsm_id: dsmIds,
                    tank_id: tankId,
                    nozzle_id: nozzle_id,
                    commodity_id: commodityId,
                    start_reading: startReading,
                    close_reading: parseFloat(closeReading),
                    testing: parseFloat(testing),
                });
            });

            const payload = {
                date: shiftdata.date,
                shift: shiftdata.shift,
                day_shift: shiftdata.day_shift_no,
                petro_id: petrodata.petro_id,
                employee_id: petrodata.user_id,
                nozzleListEntry: nozzleListEntries,
            };

            console.log("Payload:", JSON.stringify(payload, null, 2));

            if (petrodata && shiftdata && base_url) {
                await axios.post(`${base_url}/addShiftWiseNozzleClosingReadingEntry/${financialYear}`, payload);
                console.log("Data submitted successfully.");

                const response = await axios.post(`${base_url}/getNozzleListReadings/${financialYear}`, {
                    shift: shiftdata.shift,
                    employee_id: petrodata.user_id,
                    date: shiftdata.date,
                    petro_id: petrodata.petro_id,
                    day_shift: shiftdata.day_shift_no,
                });

                const data = response.data.data;
                setNozzleListReadings(data);

                const initialReadings = {};
                data.forEach((item) => {
                    if (item?.ShiftWiseNozzle) {
                        initialReadings[item.ShiftWiseNozzle.nozzle_id] = {
                            startReading: parseFloat(item.ShiftWiseNozzle.start_reading) || 0,
                            closeReading: parseFloat(item.ShiftWiseNozzle.closing_reading) || 0,
                            testing: parseFloat(item.ShiftWiseNozzle.testing) || 0,
                            rate: parseFloat(item.ShiftWiseNozzle.rate) || 0,
                            amount: item.ShiftWiseNozzle.amount,
                            total_sale: item.ShiftWiseNozzle.total_sale,
                            maxReading: item.Nozzle.max_reading
                        };
                    }
                });

                setEditReadings(initialReadings);
                setEditingIndex(null);
                setIsModalOpen(false);
                setEditIndex(null);
                console.log("Form submitted successfully");
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            }
        }
    };





    const handleEdit = (index) => {
        setIsModalOpen(true);
        setEditIndex(index);
    };






    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PuffLoader size={150} color={"#000000"} loading={loading} />
            </div>
        );
    }

    return (
        <div className="h-full min-h-screen flex bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 overflow-hidden bg-gray-100">
            <Navbar petrodata={petrodata} />
            <main className="flex-1 overflow-x-hidden focus:outline-none">
                <div className=" relative z-0 overflow-x-hidden overflow-y-auto">
                    {isEditModalOpen && (
                        <div className="flex flex-row justify-between mt-20 lg:mt-5  items-center px-4 max-w-96 mx-auto rounded-md lg:rounded-lg lg:max-w-5xl lg:px-8 p-4  bg-navbar text-white gap-1">
                            <div className="text-xl lg:text-2xl">Add Nozzle Reading</div>
                            <div>
                                <button
                                    className="lg:w-10 w-6 h-6 lg:h-10 p-0 lg:p-2 bg-navbar border-2 border-navbar hover:border-white hover:bg-white rounded-full"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    <div className="mx-auto lg:w-5 h-5 w-5 lg:h-5">
                                        <svg
                                            fill="#383838"
                                            version="1.1"
                                            id="Layer_1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/${financialYear}999/xlink"
                                            viewBox="0 0 512 512"
                                            xmlSpace="preserve"
                                        >
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
                    {noozleData &&
                        noozleData.map((item) => {
                            const nozzleId = item?.NozzlesAssign?.nozzle_id;
                            const { closeReading, startReading, testing } =
                                readings[nozzleId] || {};
                            const rate = item?.rate;
                            const maxReading = item?.Nozzle?.max_reading;
                            const { sale, amount } = handleCalculation(
                                startReading,
                                closeReading,
                                testing,
                                rate,
                                maxReading
                            );

                            return (
                                <React.Fragment key={item.NozzlesAssign.nozzle_id}>


                                    {!isEditModalOpen && !shouldFetchReadings && (
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                className="bg-navbar fixed w-16 max-w-none min-w-16 h-16 border-2 p-0 border-white right-0 bottom-0 m-5 rounded-full hover:invert text-white"
                                                onClick={() => setIsEditModalOpen(true)}
                                            >
                                                <img
                                                    src={add}
                                                    className="w-14 h-14 m-auto p-3"
                                                    alt=""
                                                />
                                            </button>
                                        </div>
                                    )}






                                    {isEditModalOpen && (
                                        <div>
                                            <div className="px-4 lg:px-8">
                                                <div className="py-6">
                                                    <div className="max-w-96 lg:max-w-5xl mx-auto sm:px-6 lg:px-8">
                                                        <form
                                                            id="my-form"
                                                            onSubmit={handleSubmit}
                                                            className="bg-card grid grid-cols-2 gap-2 lg:gap-5 lg:px-10 lg:py-14 shadow-md rounded px-4 pt-6 pb-5 lg:mb-2"
                                                        >
                                                            <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-0 lg:mb-2">
                                                                Date:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {shiftdata.formattedDate}
                                                                </span>
                                                            </h2>
                                                            <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">
                                                                Shift:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {shiftdata.day_shift_no}
                                                                </span>
                                                            </h2>
                                                            <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">
                                                                Nozzle:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {item.Nozzle.name}
                                                                </span>
                                                            </h2>
                                                            <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">
                                                                Commodity:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {item.Nozzle.Item.name}
                                                                </span>
                                                            </h2>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="start-reading"
                                                                >
                                                                    Start Reading
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    readOnly
                                                                    disabled
                                                                    value={
                                                                        readings[nozzleId]
                                                                            ?.startReading || ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleInputChange(
                                                                            nozzleId,
                                                                            "startReading",
                                                                            e.target.value,
                                                                            item.Nozzle.max_reading
                                                                        )
                                                                    }
                                                                />
                                                                {errors.startReading && (
                                                                    <div className="text-red-500">
                                                                        {errors.startReading}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="close-reading"
                                                                >
                                                                    Close Reading
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={
                                                                        readings[nozzleId]
                                                                            ?.closeReading || ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleInputChange(
                                                                            nozzleId,
                                                                            "closeReading",
                                                                            e.target.value,
                                                                            item.Nozzle.max_reading
                                                                        )
                                                                    }
                                                                />
                                                                {errors[nozzleId] && (
                                                                    <span className="text-red-500 text-sm">
                                                                        {errors[nozzleId]}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="testing"
                                                                >
                                                                    Testing
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={
                                                                        readings[nozzleId]?.testing ||
                                                                        ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleInputChange(
                                                                            nozzleId,
                                                                            "testing",
                                                                            e.target.value,
                                                                            item.Nozzle.max_reading
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="total-sale"
                                                                >
                                                                    Sale
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={sale}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="rate"
                                                                >
                                                                    Rate
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={rate}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="amount"
                                                                >
                                                                    Amount
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={amount}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            {isEditModalOpen && (
                                                                <div className="col-span-2 text-center mt-4">
                                                                    <button
                                                                        type="submit"
                                                                        className="bg-navbar text-white py-2 px-4 rounded hover:invert"
                                                                    >
                                                                        submit
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        }
                        )
                    }
                    {!isEditModalOpen && !isModalOpen && (
                        <div className="w-[90vw]  lg:w-[80.5vw] bg-navbar lg:fixed relative lg:mt-5 mt-16 mx-5  rounded-md px-8 py-5 ">
                            <div className="  flex justify-between">
                                <h2 className="block    text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                                    Date:{" "}
                                    <span className="text-red-500 font-medium">
                                        {" "}
                                        {shiftdata.formattedDate}
                                    </span>
                                </h2>
                                <h2 className="block   text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                                    {" "}
                                    Shift:{" "}
                                    <span className="text-red-500 font-medium">
                                        {" "}
                                        {shiftdata.day_shift_no}
                                    </span>
                                </h2>
                            </div>
                        </div>
                    )}
                    {shouldFetchAdd === true ? (
                        <>
                            {!isEditModalOpen && !isModalOpen && (
                                <div className="flex  justify-center items-center flex-row w-full h-[80vh] lg:h-screen gap-2 py-2">

                                    <div className="mt-5 mx-5   lg:mt-28 flex lg:flex-row  gap-3 lg:gap-5  my-auto  lg:my-auto auto-cols-max  rounded-lg flex-col   h-fit p-4 shadow">
                                        {nozzleListReadings &&
                                            nozzleListReadings.map((data) => {
                                                const nozzle = data.ShiftWiseNozzle;
                                                const nozzleName = data.Nozzle;
                                                const nozzleItem = data.Item;
                                                const shiftWiseNozzle = data.ShiftWiseNozzle || {};
                                                return (
                                                    <div
                                                        key={nozzle.id}
                                                        className="flex flex-col bg-white  gap-3 lg:gap-3 border border-black p-5 rounded-lg lg:text-lg text-lg"
                                                    >
                                                        <div className="flex flex-col gap-3 lg:gap-3 text-redish  p-3 lg:p-5 rounded-lg lg:text-lg text-lg">
                                                            <div className="flex flex-col gap-3 w-full justify-between">
                                                                {nozzleItem.name && (
                                                                    <h3 className="text-orange text-lg font-semibold">
                                                                        Nozzle: {nozzleItem.name}
                                                                    </h3>
                                                                )}
                                                                {nozzleName.name && (
                                                                    <h3 className="text-orange text-lg font-semibold">
                                                                        Commodity: {nozzleName.name}
                                                                    </h3>
                                                                )}
                                                            </div>
                                                            {shiftWiseNozzle.start_reading !== undefined && (
                                                                <p className="text-gray-700 font-semibold">
                                                                    Start Reading: {shiftWiseNozzle.start_reading}
                                                                </p>
                                                            )}
                                                            {shiftWiseNozzle.closing_reading !== undefined && (
                                                                <p className="text-gray-700 font-semibold">
                                                                    Close Reading: {shiftWiseNozzle.closing_reading}
                                                                </p>
                                                            )}
                                                            {shiftWiseNozzle.testing !== undefined && (
                                                                <p className="text-gray-700 font-semibold">
                                                                    Testing: {shiftWiseNozzle.testing}
                                                                </p>
                                                            )}
                                                            {shiftWiseNozzle.total_sale !== undefined && (
                                                                <p className="text-gray-700 font-semibold">
                                                                    Sale: {shiftWiseNozzle.total_sale}
                                                                </p>
                                                            )}
                                                            {shiftWiseNozzle.rate !== undefined && (
                                                                <p className="text-gray-700 font-semibold">
                                                                    Rate: {shiftWiseNozzle.rate}
                                                                </p>
                                                            )}
                                                            {shiftWiseNozzle.amount !== undefined && (
                                                                <p className="text-gray-700 font-semibold">
                                                                    Amount: {shiftWiseNozzle.amount}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            className="mx-auto bg-navbar flex justify-center w-1/3 rounded-xl"
                                                            onClick={() => handleEdit(nozzle.id)}
                                                        >
                                                            <div className="px-2 invert flex w-10 h-10">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        d="M20.548 3.452a1.542 1.542 0 0 1 0 2.182l-7.636 7.636-3.273 1.091 1.091-3.273 7.636-7.636a1.542 1.542 0 0 1 2.182 0zM4 21h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-2 0v7H5V6h7a1 1 0 0 0 0-2H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z"
                                                                        fill="#000"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </button>
                                                    </div>
                                                );
                                            })}

                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex h-[79vh] lg:h-screen justify-center items-center w-full  px-4 sm:px-6 lg:px-8">
                            <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10 border border-gray-300 max-w-md sm:max-w-lg lg:max-w-2xl">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl text-red-500 mb-4 text-center">Nozzle is not Assigned.</h1>
                                <p className="text-gray-700 text-center sm:text-lg">Please contact your administrator or try again later.</p>
                            </div>
                        </div>
                    )}
                    {isModalOpen && (
                        <div className="flex flex-row justify-between mt-20 lg:mt-5  items-center px-4 max-w-96 mx-auto rounded-md lg:rounded-lg lg:max-w-5xl lg:px-8 p-4  bg-navbar text-white gap-1">
                            <div className="text-xl lg:text-2xl">Update Nozzle Reading</div>
                            <div>
                                <button
                                    className="lg:w-10 w-6 h-6 lg:h-10 p-0 lg:p-2 bg-navbar border-2 border-navbar hover:border-white hover:bg-white rounded-full"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <div className="mx-auto lg:w-5 h-5 w-5 lg:h-5">
                                        <svg
                                            fill="#383838"
                                            version="1.1"
                                            id="Layer_1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/${financialYear}999/xlink"
                                            viewBox="0 0 512 512"
                                            xmlSpace="preserve"
                                        >
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
                    {nozzleListReadings &&
                        nozzleListReadings.map((item) => {
                            const nozzleId = item?.ShiftWiseNozzle?.nozzle_id;
                            const rate = item?.ShiftWiseNozzle?.rate;
                            const maxReading = item?.Nozzle?.max_reading;
                            const { sale, amount } = handleEditCalculation(
                                editreadings[nozzleId]?.startReading,
                                editreadings[nozzleId]?.closeReading,
                                editreadings[nozzleId]?.testing,
                                rate,
                                maxReading
                            );

                            return (
                                <React.Fragment key={item?.ShiftWiseNozzle?.nozzle_id}>
                                    {isModalOpen && (
                                        <div>
                                            <div className="px-4 lg:px-8">
                                                <div className="py-6">
                                                    <div className="max-w-96 lg:max-w-5xl mx-auto sm:px-6 lg:px-8">
                                                        <form
                                                            id="my-form"
                                                            onSubmit={handleEditSubmit}
                                                            className="bg-card grid grid-cols-2 gap-2 lg:gap-5 lg:px-10 lg:py-14 shadow-md rounded px-4 pt-6 pb-5 lg:mb-2"
                                                        >
                                                            <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-0 lg:mb-2">
                                                                Date:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {shiftdata.formattedDate}
                                                                </span>
                                                            </h2>
                                                            <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">
                                                                Shift:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {shiftdata.day_shift_no}
                                                                </span>
                                                            </h2>
                                                            <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">
                                                                Nozzle:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {item?.Nozzle?.name}
                                                                </span>
                                                            </h2>
                                                            <h2 className="block text-gray-700 text-base lg:text-lg font-bold mb-2">
                                                                Commodity:{" "}
                                                                <span className="text-red-500 font-medium">
                                                                    {item?.Item?.name}
                                                                </span>
                                                            </h2>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="start-reading"
                                                                >
                                                                    Start Reading
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    readOnly
                                                                    disabled
                                                                    value={
                                                                        editreadings[nozzleId]?.startReading || ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleEditInputChange(
                                                                            nozzleId,
                                                                            "startReading",
                                                                            e.target.value,
                                                                            item.Nozzle.max_reading
                                                                        )
                                                                    }
                                                                />
                                                                {/* {errors[nozzleId] && (
                                                                    <span className="text-red-500 text-sm">
                                                                        {errors[nozzleId]}
                                                                    </span>
                                                                )} */}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="close-reading"
                                                                >
                                                                    Close Reading
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={
                                                                        editreadings[nozzleId]?.closeReading || ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleEditInputChange(
                                                                            nozzleId,
                                                                            "closeReading",
                                                                            e.target.value,
                                                                            item.Nozzle.max_reading
                                                                        )
                                                                    }
                                                                />
                                                                {errors[nozzleId] && (
                                                                    <span className="text-red-500 text-sm">
                                                                        {errors[nozzleId]}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="testing"
                                                                >
                                                                    Testing
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={editreadings[nozzleId]?.testing || ""}
                                                                    onChange={(e) =>
                                                                        handleEditInputChange(
                                                                            nozzleId,
                                                                            "testing",
                                                                            e.target.value,
                                                                            item.Nozzle.max_reading
                                                                        )
                                                                    }
                                                                />
                                                                {/* {errors[nozzleId] && (
                                                                    <span className="text-red-500 text-sm">
                                                                        {errors[nozzleId]}
                                                                    </span>
                                                                )} */}
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="total-sale"
                                                                >
                                                                    Sale
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={sale}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="rate"
                                                                >
                                                                    Rate
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={rate}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label
                                                                    className="block text-gray-700 text-md font-bold mb-2"
                                                                    htmlFor="amount"
                                                                >
                                                                    Amount
                                                                </label>
                                                                <input
                                                                    autoComplete="off"
                                                                    className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                    type="number"
                                                                    value={amount}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            {isModalOpen && (
                                                                <div className="col-span-2 text-center mt-4">
                                                                    <button
                                                                        type="submit"
                                                                        className="bg-navbar text-white py-2 px-4 rounded hover:invert"
                                                                    >
                                                                        Update
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                </div>
            </main>
        </div>
    );
};

export default NoozleReading;
