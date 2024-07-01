import { useState, useRef } from "react";

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

import React from "react";

function Reciept({ petrodata }) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [creditdata, setCreditData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedLedgerName, setSelectedLedgerName] = useState(null);
    const [ledgerId, setLedgerId] = useState(null);
    const [LedgerNamedata, setLedgerNamedata] = useState([]);
    // const [ledgerId, setLedgerId] = useState(null); // New state for ledger ID
    const [noozleData, setNoozleData] = useState([]);
    const [batch, setbatch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [submittedData, setSubmittedData] = useState([]);
    const [amount, setamount] = useState("");
    const [narration, setnarration] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const [errorss, setErrorss] = useState({});

    const [editData, setEditData] = useState({
        selectedLedgerName: "",
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
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = parseFloat(value);

        setEditData((prevData) => {
            let updatedData = { ...prevData };
            let errorss = { ...errors };

            // Update the value in updatedData
            updatedData[name] = value;

            // Reset selectedVehicle when editing selectedLedgerName
            if (name === "selectedLedgerName") {
                updatedData.selectedLedgerName = value;

            }

            setErrors(errorss);

            return updatedData;
        });
    };

    const validateEditForm = () => {
        const newErrors = {};

        // Check if selectedLedgerName is null or empty
        if (
            !editData.selectedLedgerName ||
            editData.selectedLedgerName.trim() === ""
        ) {
            newErrors.selectedLedgerName = "LedgerName is required";
        }
        if (
            !editData.amount ||
            editData.amount.trim() === ""
        ) {
            newErrors.amount = "Amount is required"
        }

        // if (String(editData.narration).length >= 200) {
        //     newErrors.editData.narration = "Narration exceeded!";
        // }
        setErrorss(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmitEdit = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (validateEditForm()) {
            // Ensure editData is defined
            if (!editData) {
                console.error("editData is undefined");
                return;
            }

            // Create a copy of submittedData
            const updatedData = [...submittedData];

            // Update the item at the editingIndex with editData
            updatedData[editingIndex] = editData;

            // Update local storage
            localStorage.setItem(
                "submittedRecieptData",
                JSON.stringify(updatedData)
            );

            // Update state with the edited data
            setSubmittedData(updatedData);

            // Close the edit modal
            setIsEditModalOpen(false);

            // Reset editingIndex
            setEditingIndex(null);
        }
    };
    const dropdownRef = useRef(null);
    useEffect(() => {
        const storedData = JSON.parse(
            localStorage.getItem("submittedRecieptData")
        );
        if (storedData) {
            setSubmittedData(storedData);
        }
    }, []);
    const validateForm = () => {
        const newErrors = {};

        // if (!selectedLedgerName) {
        //     newErrors.selectedLedgerName = 'LedgerName is required';
        // }
        if (searchQuery !== selectedLedgerName) {
            newErrors.selectedLedgerName = "Ledger Name is required";
        }
        // Optionally, if you want to update the state or errors immediately:
        setErrors(newErrors);

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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Validate the form inputs
        if (validateForm()) {
            const newData = {
                selectedLedgerName,
                batch,
                amount,
                narration,
            };

            // Update or add the new data to localStorage
            const existingData =
                JSON.parse(localStorage.getItem("submittedRecieptData")) || [];

            if (editingIndex !== null && editingIndex !== undefined) {
                existingData[editingIndex] = newData; // Update existing data if editing
            } else {
                existingData.push(newData); // Add new data if not editing
            }

            // Save updated data back to localStorage
            localStorage.setItem(
                "submittedRecieptData",
                JSON.stringify(existingData)
            );

            // Update state variables and UI after successful submission
            setSubmittedData(existingData);
            setSelectedLedgerName("");
            setSearchQuery("")
            setamount("");
            setnarration("");
            setEditingIndex(null);
            setShowDropdown(false);
            setSearchQuery("");

            console.log("Form submitted successfully");
            console.log(existingData);

            onClose(); // Close modal or perform other UI actions after submission
        }
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
        localStorage.setItem("submittedRecieptData", JSON.stringify(updatedData));
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
        axios
            .post(`${base_url}/assignNozzleList/1`, {
                shift: 11,
                emp_id: "24",
                date: "2024-04-11",
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
            .then((response) => {
                const data = response.data.data;
                setNoozleData(data);
                // Initialize readings state
                console.log(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [petrodata.petro_id, petrodata.daily_shift, base_url]);

    useEffect(() => {
        axios
            .post(`${base_url}/customerlist/1`, {
                petro_id: petrodata.petro_id,
            })
            .then((response) => {
                if (response.status === 200 && response.data.data) {
                    const data = response.data.data;
                    const values = Object.values(data);
                    setLedgerNamedata(values);
                } else {
                    console.error('Error fetching data: Invalid response format');
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [base_url, petrodata]);

    const handleSelectLedgerName = (item) => {
        setSelectedLedgerName(item);
        // setLedgerId(LedgerName.Ledger.id);
        setSearchQuery(item);
        setShowDropdown(false); // Hide the dropdown after selecting
        setEditData((prevState) => ({
            ...prevState,
            selectedLedgerName: item,
        }));
    };

    useEffect(() => {
        axios
            .post(`${base_url}/customerlist/1`, {
                petro_id: petrodata.petro_id,
            })
            .then((response) => {
                console.log("customerlist data:", response.data.data);
                // Ensure the response data is an array
                if (Array.isArray(response.data.data)) {
                    setLedgerNamedata(response.data.data);
                } else {
                    console.error("Unexpected data format:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [petrodata.petro_id, base_url]);

    useEffect(() => {
        axios
            .post(`${base_url}/empcurrentShiftData/7/24/1`, {
                shift: 11,
                emp_id: "24",
                date: "2024-04-11",
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            })
            .then((response) => {
                const { shift, day_shift_no, date } = response.data.data.DailyShift;
                const formattedDate = formatDate(date);
                setCreditData({ shift, day_shift_no, date: formattedDate });
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [petrodata.petro_id, petrodata.daily_shift, base_url]);
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
    return (
        <div className="h-full min-h-screen flex overflow-hidden  bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 ">
            <Navbar petrodata={petrodata}  />
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                <h1 className="relative block  lg:hidden text-white mx-auto w-[70%] text-center top-4 text-2xl z-20">
                    Reciept
                </h1>
                <div className="flex flex-wrap gap-3">
                    <Button
                        className="bg-navbar fixed  w-16 max-w-none min-w-16 h-16 border-2 p-0 border-white right-0   bottom-0 m-5 rounded-full hover:invert text-white"
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
                                    Add Credit Sale
                                </ModalHeader>
                                <form onSubmit={handleSubmit}>
                                    <ModalBody className="px-4 lg:px-8">
                                        <>
                                            <div className="mb-4 flex justify-between">
                                                <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">
                                                    Date:{" "}
                                                    <span className="text-red-500 font-medium">
                                                        {" "}
                                                        {creditdata.date}
                                                    </span>
                                                </h2>
                                                <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">
                                                    {" "}
                                                    Shift:{" "}
                                                    <span className="text-red-500 font-medium">
                                                        {" "}
                                                        {creditdata.day_shift_no}
                                                    </span>
                                                </h2>
                                            </div>
                                        </>

                                        {/* LedgerName */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2  gap-3">
                                            {/* LedgerName */}
                                            <div className="flex flex-col col-span-2 lg:col-span-1 gap-1">
                                                <label
                                                    htmlFor="LedgerName"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Ledger Name
                                                </label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={handleSearchChange}
                                                        onClick={() => setShowDropdown(true)} // Show dropdown when input is clicked
                                                        placeholder="Search Ledger Names"
                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                    {errors.selectedLedgerName && (
                                                        <span className="text-red-500 text-sm">
                                                            {errors.selectedLedgerName}
                                                        </span>
                                                    )}

                                                    {showDropdown && ( // Show dropdown only if showDropdown is true
                                                        <ul
                                                            ref={dropdownRef}
                                                            className="mt-1 capitalize absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60"
                                                        >
                                                            {LedgerNamedata.length === 0 ? (
                                                                <li className="py-2 px-3 text-gray-500">
                                                                    No data available
                                                                </li>
                                                            ) : (
                                                                LedgerNamedata.filter((item) =>
                                                                    item.toLowerCase().includes(searchQuery.toLowerCase())
                                                                ) // Filter based on search query
                                                                    .map((item, index) => (
                                                                        <li
                                                                            key={index}
                                                                            className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100"
                                                                            onClick={() => handleSelectLedgerName(item)}
                                                                        >
                                                                            {item}
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
                                                <input
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
                                                <input
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
                                        <Button className="bg-gray-800 text-white" type="submit">
                                            Submit
                                        </Button>
                                    </ModalFooter>
                                </form>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {!isEditModalOpen && (
                    <div className="w-[90vw] lg:w-[80.5vw] bg-navbar lg:mt-5 mt-10 mx-5 fixed rounded-md px-8 py-5 ">
                        <div className="  flex justify-between">
                            <h2 className="block    text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                                Date:{" "}
                                <span className="text-red-500 font-medium">
                                    {" "}
                                    {creditdata.date}
                                </span>
                            </h2>
                            <h2 className="block   text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                                {" "}
                                Shift:{" "}
                                <span className="text-red-500 font-medium">
                                    {" "}
                                    {creditdata.day_shift_no}
                                </span>
                            </h2>
                        </div>
                    </div>
                )}
                <div className=" mt-28 mx-5 grid grid-cols-1 lg:mt-20 lg:grid-cols-2 gap-3 lg:gap-10">
                    {submittedData.map(
                        (data, index) =>
                            // Check if essential data fields are present before rendering the card
                            data?.selectedLedgerName && (
                                <div
                                    key={index}
                                    className=" flex flex-col mt-5 lg:mt-10 justify-between lg:max-w-3xl max-w-sm lg:p-6 p-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                                >
                                    <h5 className="lg:mb-1 mb-1 text-lg lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {data.selectedLedgerName}
                                    </h5>
                                    <div className="lg:my-2 my-1 grid grid-cols-2 lg:grid-cols-2 lg:gap-2 gap-1 lg:text-lg text-xs">
                                        {data.amount && (
                                            <p className="text-gray-700 font-semibold">
                                                Amount: <span className="font-bold">{data.amount}</span>{" "}
                                            </p>
                                        )}
                                    </div>
                                    <div className="lg:my-2 my-1 grid grid-cols-2 lg:grid-cols-2 lg:gap-2 gap-1 lg:text-lg text-xs">
                                        {data.batch && (
                                            <p className="text-gray-700 font-semibold">
                                                Batch: <span className="font-bold">{data.batch}</span>{" "}
                                            </p>
                                        )}
                                    </div>
                                    <div className="lg:my-1 my-1 grid grid-cols-1 lg:grid-cols-1 lg:gap-2 gap-1 lg:text-lg text-xs">
                                        {data.narration && (
                                            <p className="text-gray-700 font-semibold">
                                                Narration:{" "}
                                                <span className="font-normal break-words">{data.narration}</span>{" "}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-row justify-around mt-5">
                                        <button
                                            className="px-2 w-10 h-10"
                                            color="primary"
                                            onClick={() => handleEdit(index)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    d="M20.548 3.452a1.542 1.542 0 0 1 0 2.182l-7.636 7.636-3.273 1.091 1.091-3.273 7.636-7.636a1.542 1.542 0 0 1 2.182 0zM4 21h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-2 0v7H5V6h7a1 1 0 0 0 0-2H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z"
                                                    fill="#000"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            className="px-2 w-10 h-10"
                                            onClick={() => handleRemove(index)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    d="M5.755 20.283 4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z"
                                                    fill="#F44336"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )
                    )}

                    {isEditModalOpen && (
                        <div className="fixed inset-0  flex items-center justify-center bg-gray-800 bg-opacity-50">
                            <div className="rounded-lg lg:max-w-4xl w-full">
                                <div className="flex p-5 flex-col text-2xl bg-navbar text-white gap-1">
                                    Edit Credit Sale
                                </div>
                                <div className="bg-white p-6 ">
                                    {/* Edit form */}
                                    <form onSubmit={handleSubmitEdit}>
                                        <div className="">
                                            {creditdata.data && (
                                                <>
                                                    <div className="mb-4 flex justify-between">
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">
                                                            Date:{" "}
                                                            <span className="text-red-500 font-medium">
                                                                {creditdata.data.DailyShift.date}
                                                            </span>
                                                        </h2>
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">
                                                            Shift:{" "}
                                                            <span className="text-red-500 font-medium">
                                                                {creditdata.data.DailyShift.day_shift_no}
                                                            </span>
                                                        </h2>
                                                    </div>
                                                </>
                                            )}
                                            <div className=" grid grid-cols-1 lg:grid-cols-2  gap-3">
                                                {/* LedgerName */}
                                                <div className="flex flex-col col-span-2 lg:col-span-1 gap-1">
                                                    <label
                                                        htmlFor="LedgerName"
                                                        className="block text-sm font-medium text-gray-700"
                                                    >
                                                        Ledger Name
                                                    </label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="text"
                                                            value={editData.selectedLedgerName}
                                                            name="selectedLedgerName"
                                                            onChange={handleEditChange}
                                                            onClick={() => setShowDropdown(true)} // Show dropdown when input is clicked
                                                            placeholder="Search Ledger Names"
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                        {errorss.selectedLedgerName && (
                                                            <span className="text-red-500 text-sm">
                                                                {errorss.selectedLedgerName}
                                                            </span>
                                                        )}

                                                        {showDropdown && ( // Show dropdown only if showDropdown is true
                                                            <ul
                                                                ref={dropdownRef}
                                                                className="mt-1 capitalize absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60"
                                                            >
                                                                {LedgerNamedata.length === 0 ? (
                                                                    <li className="py-2 px-3 text-gray-500">
                                                                        No data available
                                                                    </li>
                                                                ) : (
                                                                    LedgerNamedata.filter((item) =>
                                                                        item.toLowerCase().includes(editData.selectedLedgerName.toLowerCase())
                                                                    ) // Filter based on search query
                                                                        .map((item, index) => (
                                                                            <li
                                                                                key={index}
                                                                                className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100"
                                                                                onClick={() => handleSelectLedgerName(item)}
                                                                            >
                                                                                {item}
                                                                            </li>
                                                                        ))
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="flex flex-col col-span-1 lg:col-span-1  gap-1">
                                                    <label htmlFor="slip">Amount</label>
                                                    <input
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
                                                    <input
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
                                                {/* Narration */}
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
                    )}
                </div>
            </main>
        </div>
    );
}

export default Reciept;
