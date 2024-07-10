import { useState, useRef } from "react";
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';
import axios from "axios";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";
import add from "../images/add.svg";
import { useLongPress } from 'use-long-press';
import { Spinner } from "@nextui-org/react";

import React from "react";

function Reciept({ petrodata }) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [ShiftData, setShiftData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [dsmIds, setDsmIds] = useState([]); // State to store dsmIds

    const [selectedWalletName, setSelectedWalletName] = useState(null);
    const [WalletNamedata, setWalletNamedata] = useState([]);
    // const [ledgerId, setLedgerId] = useState(null); // New state for ledger ID
    // const [noozleData, setNoozleData] = useState([]);
    const [cardSales, setCardSales] = useState([]);
    const [batch, setbatch] = useState("");
    const [vehicle, setVehicle] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [submittedData, setSubmittedData] = useState([]);
    const [amount, setamount] = useState("");
    const [narration, setnarration] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const [errorss, setErrorss] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editData, setEditData] = useState({
        selectedWalletName: "",
        amount: "",
        batch: "",
        narration: "",
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Function to open edit modal and populate with data
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };
    const base_url = process.env.REACT_APP_API_URL;
    // Function to handle changes in edit modal


    useEffect(() => {
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
    }, [petrodata, base_url]);

    useEffect(() => {
        if (petrodata && ShiftData && petrodata.daily_shift && base_url) {
            axios.post(`${base_url}/cardSaleList/1`, {
                shift: `${ShiftData.shift}`,
                employee_id: petrodata.user_id,
                type: 1,
                date: ShiftData.date,
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
                .then(response => {
                    setCardSales(response.data.data);
                    console.log('setCardSales', response.data.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, petrodata.daily_shift, base_url]);


    useEffect(() => {
        if (petrodata && ShiftData && petrodata.daily_shift && base_url) {
            axios
                .post(`${base_url}/assignNozzleList/1`, {
                    shift: ShiftData.shift,
                    emp_id: petrodata.user_id,
                    date: ShiftData.date,
                    petro_id: petrodata.petro_id,
                    day_shift: petrodata.daily_shift,
                })
                .then((response) => {
                    const data = response.data.data;

                    const extractedDsmIds = data.map(item => item.NozzlesAssign.dsm_id);
                    setDsmIds(extractedDsmIds);
                    console.log('extractedDsmIds', extractedDsmIds)
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        }
    }, [petrodata, ShiftData, petrodata.daily_shift, base_url]);


    const handleEditChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = parseFloat(value);

        setEditData((prevData) => {
            let updatedData = { ...prevData };
            let errorss = { ...errors };


            updatedData[name] = value;


            if (name === "selectedWalletName") {
                updatedData.selectedWalletName = value;

            }

            setErrors(errorss);

            return updatedData;
        });
    };

    const validateEditForm = () => {
        const newErrors = {};


        if (
            !editData.selectedWalletName ||
            editData.selectedWalletName.trim() === ""
        ) {
            newErrors.selectedWalletName = "WalletName is required";
        }
        if (
            !editData.amount ||
            editData.amount.trim() === ""
        ) {
            newErrors.amount = "Amount is required"
        }

        setErrorss(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmitEdit = (e) => {
        e.preventDefault();
        if (validateEditForm()) {

            if (!editData) {
                console.error("editData is undefined");
                return;
            }


            const updatedData = [...submittedData];


            updatedData[editingIndex] = editData;


            localStorage.setItem(
                "submittedWalletData",
                JSON.stringify(updatedData)
            );

            setSubmittedData(updatedData);


            setIsEditModalOpen(false);


            setEditingIndex(null);
        }
    };
    const dropdownRef = useRef(null);
    useEffect(() => {
        const storedData = JSON.parse(
            localStorage.getItem("submittedWalletData")
        );
        if (storedData) {
            setSubmittedData(storedData);
        }
    }, []);
    const validateForm = () => {
        const newErrors = {};
        if (!selectedWalletName || !WalletNamedata.some(item => item.card_name === selectedWalletName.name)) {
            newErrors.selectedWalletName = 'Please select a valid Account Name from the list.';
        }

        if (!searchQuery || !WalletNamedata.some(item => item.card_name === searchQuery)) {
            newErrors.selectedWalletName = 'Please select a valid Account Name from the list.';
        }
        const parsedamount = parseFloat(amount);
        if (!parsedamount) {
            newErrors.amount = "Amount is required";
        }
        if (parsedamount <= 0) {
            newErrors.amount = "Amount must be greater than 0";
        } else if (parsedamount > 10000000) {
            newErrors.amount = "Amount cannot exceed 10,000,000";
        }
        if (String(narration).length >= 200) {
            newErrors.narration = "Narration exceeded!";
        }
        if (String(vehicle).length > 10) {
            newErrors.vehicle = "vehicle invalid!";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (isSubmitting) {
            return; // Prevent multiple submissions
        }

        setIsSubmitting(true);
        // Validate the form inputs
        if (validateForm()) {
            const payload = {
                petro_id: petrodata.petro_id,
                shift: ShiftData.shift,
                dsm_id: dsmIds[0],
                day_shift: ShiftData.day_shift_no,
                amount: amount,
                card_id: selectedWalletName.id,
                batch_no: batch,
                vehicle_no: vehicle,
                description: narration,
                type: 1,
                date: ShiftData.date,
            };

            try {
                await axios.post(`${base_url}/addCardSale/1`, payload);
                console.log('Data submitted successfully.');

                // Fetch updated card sales data after successful submission
                const response = await axios.post(`${base_url}/cardSaleList/1`, {
                    shift: `${ShiftData.shift}`,
                    employee_id: petrodata.user_id,
                    type: 1,
                    date: ShiftData.date,
                    petro_id: petrodata.petro_id,
                    day_shift: petrodata.daily_shift,
                });
                setCardSales(response.data.data);
                console.log('Updated card sales:', response.data.data);

                // Reset form fields and UI state
                setSelectedWalletName("");
                setSearchQuery("");
                setamount("");
                setnarration("");
                setEditingIndex(null);
                setShowDropdown(false);
                setVehicle("");
                setbatch("");
                console.log("Form submitted successfully");

                onClose(); // Close modal or perform other UI actions after submission
            } catch (error) {
                console.error('Error submitting data:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                }
            }
        }
        setIsSubmitting(false);
    };



    const handleEdit = (index) => {
        console.log("Editing index:", index);
        const dataToEdit = submittedData[index];
        console.log("Data to edit:", dataToEdit);

        setEditData({ ...dataToEdit, index }); // Pass the index with the data
        setEditingIndex(index);
        setIsEditModalOpen(true);
    };

    const handleRemove = (index) => {
        const updatedData = submittedData.filter((_, i) => i !== index);
        localStorage.setItem("submittedWalletData", JSON.stringify(updatedData));
        setSubmittedData(updatedData);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        axios.post(`${base_url}/cardDropList/1`, {
            petro_id: petrodata.petro_id,
            type: 1,
        })
            .then((response) => {
                const data = response.data;
                if (data.status === 200) {
                    const WalletData = data.data.map((item) => ({
                        id: item.Card.id,
                        card_name: item.Card.card_name
                    }));
                    setWalletNamedata(WalletData);
                } else {
                    setErrors({ fetch: 'Failed to fetch data' });
                }
            })
            .catch((error) => {
                setErrors({ fetch: 'Failed to fetch data' });
            });
    }, [petrodata, base_url]);


    const handleSelectWalletName = (item) => {
        setSelectedWalletName({ id: item.id, name: item.card_name });
        setSearchQuery(item.card_name);
        setShowDropdown(false); // Hide the dropdown after selecting
        setErrors((prevState) => ({
            ...prevState,
            selectedWalletName: '',
        }));
    };


    const handleClear = () => {
        // Reset all related states to their initial values
        setSelectedWalletName("");
        setSearchQuery("");
        setShowDropdown(true); // Show the dropdown again


        // Clear the edit data related to the customer
        setEditData((prevState) => ({
            ...prevState,
            selectedWalletName: ""
        }));
    };


    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setShowDropdown(true); // Show dropdown when input value changes
        setSearchQuery(query);
    };

    const handleAmountChange = (e) => {
        let amountValue = e.target.value;
        if (amountValue > 10000000) {
            amountValue = 10000000;
            setErrors((prev) => ({
                ...prev,
                amount: "Amount cannot exceed 10,000,000",
            }));
        } else {
            setErrors((prev) => ({ ...prev, amount: "" }));
        }
        setamount(amountValue);
    };
    const handleBatchChange = (e) => {
        let batchValue = e.target.value;
        if (String(batchValue).length > 7) {
            setErrors((prev) => ({
                ...prev,
                batch: "Batch cannot exceed more",
            }));
        } else {
            setErrors((prev) => ({ ...prev, batch: "" }));
        }
        setbatch(batchValue);
    };
    const handleVehicleChange = (e) => {
        let vehicleNo = e.target.value;
        if (String(vehicleNo).length >= 10) {
            setErrors((prev) => ({
                ...prev,
                vehicle: "vehicle cannot exceed more",
            }));
        } else {
            setErrors((prev) => ({ ...prev, vehicle: "" }));
        }
        setVehicle(vehicleNo);
    };
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [swipeStates, setSwipeStates] = useState(Array(submittedData.length).fill({ isSwipedRight: false }));
    const containerRef = useRef(null);
    const [dragConstraints, setDragConstraints] = useState({ right: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            setDragConstraints({
                right: containerWidth / 4,
                left: 0 // Prevent dragging to the left
            });
        }
    }, [submittedData.length, containerRef.current]);

    const handleDragEnd = (index, event, info) => {
        if (isMobile) {
            const updatedSwipeStates = [...swipeStates];
            const swipeThreshold = containerRef.current.offsetWidth / 4; // Adjust this dynamically based on container width

            if (info.point.x > swipeThreshold) {
                updatedSwipeStates[index] = { isSwipedRight: true };
            } else {
                updatedSwipeStates[index] = { isSwipedRight: false };
            }

            setSwipeStates(updatedSwipeStates);
        }
    };

    const handleCardClick = (index) => {
        const updatedSwipeStates = [...swipeStates];
        updatedSwipeStates[index] = { isSwipedRight: false };
        setSwipeStates(updatedSwipeStates);
    };


    return (
        <div className="h-full min-h-screen flex overflow-hidden  bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 ">
            <Navbar petrodata={petrodata} />
            <main className="flex-1 relative overflow-x-hidden z-0 overflow-y-auto focus:outline-none">


                <div className="flex flex-wrap gap-3">

                    <Button
                        className="bg-navbar fixed z-10  w-16 max-w-none min-w-16 h-16 border-2 p-0 border-white right-0   bottom-0 m-5 rounded-full hover:invert text-white"
                        onPress={onOpen}
                    >
                        <img src={add} className="w-8 h-8" alt="" />
                    </Button>
                </div>
                <Modal
                    isOpen={isOpen}
                    size="5xl"
                    scrollBehavior="outside"
                    isDismissable={false}
                    isKeyboardDismissDisabled={true}
                    placement="top"
                    onOpenChange={onOpenChange}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col text-2xl bg-navbar text-white gap-1">
                                    Add Wallet Sale
                                </ModalHeader>
                                <form onSubmit={handleSubmit}>
                                    <ModalBody className="px-4 lg:px-8">
                                        <>
                                            <div className="mb-4 flex justify-between">
                                                <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">
                                                    Date:{" "}
                                                    <span className="text-red-500 font-medium">
                                                        {" "}
                                                        {ShiftData.formattedDate}
                                                    </span>
                                                </h2>
                                                <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">
                                                    {" "}
                                                    Shift:{" "}
                                                    <span className="text-red-500 font-medium">
                                                        {" "}
                                                        {ShiftData.day_shift_no}
                                                    </span>
                                                </h2>
                                            </div>
                                        </>

                                        {/* WalletName */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2  gap-3">
                                            {/* WalletName */}
                                            <div className="flex flex-col col-span-2 lg:col-span-1 gap-1">
                                                <label
                                                    htmlFor="WalletName"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Account Name
                                                </label>
                                                <div className="mt-1 relative">
                                                     <input autoComplete="off"
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={handleSearchChange}
                                                        onClick={() => setShowDropdown(true)} // Show dropdown when input is clicked
                                                        placeholder="Search Account Names"
                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                    {errors.selectedWalletName && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.selectedWalletName}
                                                        </span>
                                                    )}
                                                    {selectedWalletName && (
                                                        <button
                                                            onClick={handleClear}
                                                            className="absolute top-1 w-8 h-8 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1"
                                                        >
                                                            &#x2715;
                                                        </button>
                                                    )}
                                                    {showDropdown && (
                                                        <ul
                                                            ref={dropdownRef}
                                                            className="mt-1 capitalize absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60"
                                                        >
                                                            {WalletNamedata.length === 0 ? (
                                                                <li className="py-2 px-3 text-gray-500">
                                                                    No data available
                                                                </li>
                                                            ) : (
                                                                WalletNamedata.filter((item) =>
                                                                    item.card_name.toLowerCase().includes(searchQuery.toLowerCase())
                                                                ).map((item, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100"
                                                                        onClick={() => handleSelectWalletName(item)}
                                                                    >
                                                                        {item.card_name}
                                                                    </li>
                                                                ))
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="flex flex-col col-span-1  gap-1">
                                                <label htmlFor="slip">Amount</label>
                                                 <input autoComplete="off"
                                                    type="number"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    id="slip"
                                                    className="border p-2 border-gray-300 rounded"
                                                />
                                                {errors.amount && (
                                                    <span className="text-red-500 text-sm">
                                                        {errors.amount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col col-span-1  gap-1">
                                                <label htmlFor="slip">Batch No.</label>
                                                 <input autoComplete="off"
                                                    type="text"
                                                    value={batch}
                                                    onChange={handleBatchChange}
                                                    id="slip"
                                                    className="border p-2 border-gray-300 rounded"
                                                    maxlength="7"
                                                />
                                                {errors.batch && (
                                                    <span className="text-red-500 text-sm">
                                                        {errors.batch}

                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col col-span-1  gap-1">
                                                <label htmlFor="vehicle">Vehicle No.</label>
                                                 <input autoComplete="off"
                                                    type="text"
                                                    value={vehicle}
                                                    onChange={handleVehicleChange}
                                                    id="vehicle"
                                                    className="border p-2 border-gray-300 rounded"
                                                    maxlength="10"
                                                />
                                                {errors.vehicle && (
                                                    <span className="text-red-500 text-sm">
                                                        {errors.vehicle}

                                                    </span>
                                                )}
                                            </div>
                                            {/* Narration */}
                                            <div className="flex flex-col col-span-2  gap-1">
                                                <label htmlFor="coupen">Narration</label>
                                                <textarea
                                                    // variant="bordered"
                                                    // labelPlacement="outside"
                                                    value={narration}
                                                    placeholder="Enter your narration"
                                                    onChange={(e) => setnarration(e.target.value)}
                                                    className="border p-2 border-gray-300 rounded"
                                                />
                                                {errors.narration && (
                                                    <span className="text-red-500 text-sm">
                                                        {errors.narration}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button className="bg-red-500 text-white" onPress={onClose}>
                                            Close
                                        </Button>
                                        <Button className="bg-gray-800 text-white" type="submit" disabled={isSubmitting}>
                                            Submit
                                        </Button>
                                        <br />




                                        {isSubmitting && <Spinner label="Submitting..." color="default" />}
                                    </ModalFooter>
                                </form>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {!isEditModalOpen && (
                    <div className='w-[90vw] lg:w-[80.5vw] bg-navbar lg:fixed relative lg:mt-5 mt-16 mx-5  rounded-md px-8 py-5 '>
                        <div className="  flex justify-between">
                            <h2 className="block    text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                                Date:{" "}
                                <span className="text-red-500 font-medium">
                                    {" "}
                                    {ShiftData.formattedDate}
                                </span>
                            </h2>
                            <h2 className="block   text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                                {" "}
                                Shift:{" "}
                                <span className="text-red-500 font-medium">
                                    {" "}
                                    {ShiftData.day_shift_no}
                                </span>
                            </h2>
                        </div>
                    </div>
                )}

                <div className=" mt-5 mx-5 grid grid-cols-1 lg:mt-28 lg:grid-cols-4 gap-3 lg:gap-5">

                    {Array.isArray(cardSales) && cardSales.length > 0 ? (
                        cardSales.map((sale, index) => (
                            <div key={index} ref={containerRef} className="relative -z-0  justify-center flex flex-row overflow-hidden">
                                {isMobile && (
                                    <>
                                        {swipeStates[index] && swipeStates[index].isSwipedRight && (
                                            <button className="h-full flex flex-row rounded-lg bg-redish justify-around" onClick={() => handleRemove(index)}>
                                                <div className="px-2 w-10 h-10 my-auto" color="primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                        <path d="M5.755 20.283L4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z" fill="#fff" />
                                                    </svg>
                                                </div>
                                            </button>
                                        )}
                                    </>
                                )}
                                <motion.div
                                    className="flex select-none flex-col w-full justify-between lg:max-w-3xl max-w-sm lg:p-4 p-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                                    initial={{ x: 0 }}
                                    animate={{ x: (swipeStates[index]?.isSwipedRight ? 10 : 0) }}
                                    drag={isMobile ? "x" : false}
                                    dragConstraints={dragConstraints}
                                    onDragEnd={(event, info) => handleDragEnd(index, event, info)}
                                    onClick={() => handleCardClick(index)} // Added onClick handler
                                >
                                    <h5 className="lg:mb-1 mb-1 text-lg lg:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {sale.Card && sale.Card.card_name}
                                    </h5>
                                    <div className="lg:mb-1 mb-1  grid grid-cols-2 lg:grid-cols-2 lg:gap-2 gap-1 lg:text-basetext-xs">
                                        {sale.CardSale && sale.CardSale.amount && <p className="text-gray-700 font-semibold">
                                            Amount: <span className="font-bold"> {sale.CardSale && sale.CardSale.amount}</span>
                                        </p>}

                                        {sale.CardSale && sale.CardSale.batch_no && <p className="text-gray-700 font-semibold">
                                            Batch: <span className="font-bold"> {sale.CardSale && sale.CardSale.batch_no}</span>
                                        </p>}
                                    </div>
                                    <div className="lg:mb-1 mb-1  grid grid-cols-1 lg:grid-cols-1 lg:gap-2 gap-1 lg:text-base text-xs">
                                        {sale.CardSale && sale.CardSale.vehicle_no && <p className="text-gray-700 font-semibold">
                                            Vehicle No.: <span className="font-normal break-words"> {sale.CardSale && sale.CardSale.vehicle_no}</span>
                                        </p>}
                                    </div>
                                    {!isMobile && (
                                        <div className="flex flex-row justify-around mt-2">
                                            {/* <button className="px-2 w-10 h-10" color="primary" onClick={() => handleEdit(index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M20.548 3.452a1.542 1.542 0 0 1 0 2.182l-7.636 7.636-3.273 1.091 1.091-3.273 7.636-7.636a1.542 1.542 0 0 1 2.182 0zM4 21h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-2 0v7H5V6h7a1 1 0 0 0 0-2H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z" fill="#000" />
                            </svg>
                        </button> */}
                                            <button className="px-2 w-10 h-10" onClick={() => handleRemove(index)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                    <path d="M5.755 20.283L4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z" fill="#F44336" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </motion.div>

                            </div>

                        ))
                    ) : (
                        <p>No card sales available.</p>
                    )}
                </div>
                {/* {isEditModalOpen && (
                        <div className="fixed inset-0  flex items-center justify-center bg-gray-800 bg-opacity-50">
                            <div className="rounded-lg lg:max-w-4xl w-full">
                                <div className="flex p-5 flex-col text-2xl bg-navbar text-white gap-1">
                                    Edit Credit Sale
                                </div>
                                <div className="bg-white p-6 ">
                            
                                    <form onSubmit={handleSubmitEdit}>
                                        <div className="">
                                            {ShiftData.data && (
                                                <>
                                                    <div className="mb-4 flex justify-between">
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">
                                                            Date:{" "}
                                                            <span className="text-red-500 font-medium">
                                                                {ShiftData.data.DailyShift.date}
                                                            </span>
                                                        </h2>
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">
                                                            Shift:{" "}
                                                            <span className="text-red-500 font-medium">
                                                                {ShiftData.data.DailyShift.day_shift_no}
                                                            </span>
                                                        </h2>
                                                    </div>
                                                </>
                                            )}
                                            <div className=" grid grid-cols-1 lg:grid-cols-2  gap-3">
                                           
                                                <div className="flex flex-col col-span-2 lg:col-span-1 gap-1">
                                                    <label
                                                        htmlFor="WalletName"
                                                        className="block text-sm font-medium text-gray-700"
                                                    >
                                                        Account Name
                                                    </label>
                                                    <div className="mt-1 relative">
                                                          <input autoComplete="off" 
                                                            type="text"
                                                            value={editData.selectedWalletName}
                                                            name="selectedWalletName"
                                                            onChange={handleEditChange}
                                                            onClick={() => setShowDropdown(true)}
                                                            placeholder="Search Account Names"
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                        {errorss.selectedWalletName && (
                                                            <span className="text-red-500 text-sm">
                                                                {errorss.selectedWalletName}
                                                            </span>
                                                        )}

                                                        {showDropdown && ( 
                                                            <ul
                                                                ref={dropdownRef}
                                                                className="mt-1 capitalize absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60"
                                                            >
                                                                {WalletNamedata.length === 0 ? (
                                                                    <li className="py-2 px-3 text-gray-500">
                                                                        No data available
                                                                    </li>
                                                                ) : (
                                                                    WalletNamedata.filter((item) =>
                                                                        item.toLowerCase().includes(editData.selectedWalletName.toLowerCase())
                                                                    ) 
                                                                        .map((item, index) => (
                                                                            <li
                                                                                key={index}
                                                                                className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100"
                                                                                onClick={() => handleSelectWalletName(item)}
                                                                            >
                                                                                {item}
                                                                            </li>
                                                                        ))
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                   
                                                <div className="flex flex-col col-span-1 lg:col-span-1  gap-1">
                                                    <label htmlFor="slip">Amount</label>
                                                     <input autoComplete="off"
                                                        type="text"
                                                        value={editData.amount}
                                                        name="amount"
                                                        onChange={handleEditChange}
                                                        id="slip"
                                                        className="border p-2 border-gray-300 rounded"
                                                        maxLength="7"
                                                    />
                                                    {errorss.amount && (
                                                        <span className="text-red-500 text-sm">
                                                            {errorss.amount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col col-span-1  gap-1">
                                                    <label htmlFor="slip">Batch No.</label>
                                                     <input autoComplete="off"
                                                        type="text"
                                                        value={editData.batch}
                                                        onChange={handleEditChange}
                                                        id="slip"
                                                        name="batch"
                                                        className="border p-2 border-gray-300 rounded"
                                                        maxlength="7"
                                                    />
                                                    {errors.batch && (
                                                        <span className="text-red-500 text-sm">
                                                            {errorss.batch}

                                                        </span>
                                                    )}
                                                </div>
                                          
                                                <div className="flex flex-col col-span-2 lg:col-span-2 gap-1">
                                                    <label htmlFor="coupen">Narration</label>
                                                    <textarea
                                                        type="text"
                                                        value={editData.narration}
                                                        name="narration"
                                                        onChange={handleEditChange}
                                                        id="coupen"
                                                        className="border p-2 border-gray-300 rounded"
                                                        maxLength="200"
                                                    />
                                                    {errorss.narration && (
                                                        <span className="text-red-500 text-sm">
                                                            {errorss.narration}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row gap-5 mt-5">
                                            <Button color="primary" type="submit">
                                                Save
                                            </Button>
                                            <Button
                                                color="danger"
                                                onClick={() => setIsEditModalOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )} */}
                {/* </div> */}
            </main>
        </div>
    );
}

export default Reciept;