import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";

import Logout from "./Logout.js";
import React from "react";
function CreditSale({ petrodata }) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [creditdata, setCreditata] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryVehicle, setSearchQueryVehicle] = useState("");
    const [searchQueryFuel, setSearchQueryFuel] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedFuel, setSelectedFuel] = useState(null);
    const [vehicledata, setVehicledata] = useState([])
    const [customerdata, setCustomerdata] = useState([])
    const [ledgerId, setLedgerId] = useState(null); // New state for ledger ID
    const [noozleData, setNoozleData] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false); // State to toggle the dropdown visibility
    const [showDropdownVehicle, setShowDropdownVehicle] = useState(false); // State to toggle the dropdown visibility
    const [showDropdownFuel, setShowDropdownFuel] = useState(false); // State to toggle the dropdown visibility
    const [rate, setRate] = useState(''); // State to toggle the dropdown visibility
    const [quantity, setQuantity] = useState('');
    const [totalAmt, setTotalAmt] = useState('');
    const [driverCash, setDriverCash] = useState('');
    const [inclusiveTotal, setInclusiveTotal] = useState('');
    const [submittedData, setSubmittedData] = useState([]);
    const [slipNo, setSlipNo] = useState('');
    const [coupenNo, setCoupenNo] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [errors, setErrors] = useState({});
    const [errorss, setErrorss] = useState({});

    const [editData, setEditData] = useState({
        selectedCustomer: '',
        selectedVehicle: '',
        selectedFuel: '',
        slipNo: '',
        coupenNo: '',
        quantity: 0,
        rate: 0,
        totalAmt: 0,
        driverCash: 0,
        inclusiveTotal: 0
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Function to open edit modal and populate with data

const base_url = process.env.REACT_APP_API_URL;
    // Function to handle changes in edit modal
    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditData(prevData => {
            const updatedData = {
                ...prevData,
                [name]: value
            };

            // Update rate when fuel type changes
            if (name === 'selectedFuel') {
                const selectedFuelData = noozleData.find(item => item.Nozzle.Item.name.toLowerCase() === value.toLowerCase());
                if (selectedFuelData) {
                    updatedData.rate = selectedFuelData.rate;
                } else {
                    updatedData.rate = 0; // Default rate if fuel type not found
                }
            }

            // Reset selectedVehicle when editing selectedCustomer
            if (name === 'selectedCustomer') {
                return {
                    ...updatedData,
                    selectedCustomer: value,
                    selectedVehicle: '', // Reset selectedVehicle when editing selectedCustomer
                };
            }

            // Handle other input changes
            return {
                ...updatedData,
                [name]: value,
            };
        });
    };


    const validateEditForm = () => {
        const newErrors = {};

        // Check if selectedCustomer is null or empty
        if (!editData.selectedCustomer || editData.selectedCustomer.trim() === '') {
            newErrors.selectedCustomer = 'Customer is required';
        }

        // Check if selectedFuel is null or empty
        if (!editData.selectedFuel || editData.selectedFuel.trim() === '') {
            newErrors.selectedFuel = 'Fuel type is required';
        }

        // Check if quantity is not a positive number
        if (!editData.quantity || editData.quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0';
        }

        // Check if driverCash is negative only if a vehicle is selected
        if (editData.selectedVehicle && parseFloat(editData.driverCash) < 0) {
            newErrors.driverCash = 'Driver cash cannot be negative';
        }

        // Check if driverCash is greater than 0 and no vehicle is selected
        if (parseFloat(editData.driverCash) > 0 && !editData.selectedVehicle) {
            newErrors.driverCash = 'If driver cash is greater than 0, a vehicle must be selected';
        }

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
            localStorage.setItem('submittedData', JSON.stringify(updatedData));

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
        const storedData = JSON.parse(localStorage.getItem('submittedData'));
        if (storedData) {
            setSubmittedData(storedData);
        }
    }, []);
    const validateForm = () => {
        const newErrors = {};
        if (selectedCustomer == null) newErrors.selectedCustomer = 'Customer is required';
        // if (selectedVehicle == null) newErrors.selectedVehicle = 'Vehicle is required';
        if (selectedFuel == null) newErrors.selectedFuel = 'Fuel type is required';
        if (quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
        // Check if driverCash has a value greater than 0 without a selected vehicle
        if (parseFloat(driverCash) > 0 && selectedVehicle == null) {
            newErrors.driverCash = 'If driver cash is greater than 0, a vehicle must be selected';
        }

        // Validate negative driverCash only if a vehicle is selected
        if (selectedVehicle != null && parseFloat(driverCash) < 0) {
            newErrors.driverCash = 'Driver cash cannot be negative';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault(); // Ensure preventDefault is called on the event object
        if (validateForm()) {
            const newData = {
                selectedVehicle,
                selectedCustomer,
                selectedFuel,
                rate,
                quantity,
                totalAmt,
                driverCash,
                inclusiveTotal,
                slipNo,
                coupenNo,
            };
            setShowDropdown(false);
            const existingData = JSON.parse(localStorage.getItem('submittedData')) || [];
            if (editingIndex !== null) {
                existingData[editingIndex] = newData; // Update existing data if editing
            } else {
                existingData.push(newData); // Add new data if not editing
            }

            localStorage.setItem('submittedData', JSON.stringify(existingData));

            setSubmittedData(existingData);
            setSelectedVehicle('');
            setSelectedCustomer('');
            setSelectedFuel('');
            setRate('');
            setQuantity('');
            setTotalAmt('');
            setDriverCash('');
            setInclusiveTotal('');
            setSlipNo('');
            setCoupenNo('');
            setEditingIndex(null);
            setShowDropdown(false);
            setSearchQuery('');
            setSearchQueryVehicle('');
            setSearchQueryFuel('');
            console.log('Form submitted successfully');
            console.log(existingData)
            onClose();
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
        localStorage.setItem('submittedData', JSON.stringify(updatedData));
        setSubmittedData(updatedData);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setShowDropdownVehicle(false);
                setShowDropdownFuel(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

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
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, petrodata.daily_shift, base_url]);
    useEffect(() => {
        axios.post(`${base_url}/petro_cake/PetroAppEmployees/getSundryDebtorsLedgerList/1`, {
            "petro_id": petrodata.petro_id,
        })
            .then(response => {
                console.log('data:', response.data);
                // Ensure the response data is an array
                if (Array.isArray(response.data.data)) {
                    setCustomerdata(response.data.data);
                } else {
                    console.error('Unexpected data format:', response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, base_url]);

    useEffect(() => {
        if (ledgerId) { // Check if ledgerId is not null
            axios.post(`${base_url}/petro_cake/PetroAppEmployees/customervehList/1`, {
                "petro_id": petrodata.petro_id,
                "ledger_id": ledgerId, // Use the dynamic ledgerId
            })
                .then(response => {
                    console.log(response.data.data);
                    setVehicledata(response.data.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata.petro_id, ledgerId, base_url]); // Include ledgerId in the dependency array

    // Function to handle selection of customer
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer.Ledger.name);
        setLedgerId(customer.Ledger.id); // Update the ledger ID
        setSearchQuery(customer.Ledger.name);
        setSearchQueryVehicle(""); // Clear the vehicle number
        setSelectedVehicle(null); // Clear the selected vehicle
        setShowDropdown(false); // Hide the dropdown after selecting
        setEditData((prevState) => ({
            ...prevState,
            selectedCustomer: customer.Ledger.name
        }));

    };


    useEffect(() => {
        axios.post(`${base_url}/petro_cake/PetroAppEmployees/getSundryDebtorsLedgerList/1`, {
            "petro_id": petrodata.petro_id,
        })
            .then(response => {
                console.log('data:', response.data);
                // Ensure the response data is an array
                if (Array.isArray(response.data.data)) {
                    setCustomerdata(response.data.data);
                } else {
                    console.error('Unexpected data format:', response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, base_url]);
    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    useEffect(() => {
        axios.post(`${base_url}/petro_cake/PetroAppEmployees/customervehList/`, {
            "petro_id": petrodata.petro_id,
            "ledger_id": 800,
        })

            .then(response => {
                console.log(response.data.data)
                setVehicledata(response.data.data)
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, base_url]);

    useEffect(() => {
        axios.post(
            `${base_url}/petro_cake/petroAppEmployees/empcurrentShiftData/7/24/1`,
            {
                "shift": 11,
                "emp_id": "24",
                "date": "2024-04-11",
                "petro_id": petrodata.petro_id,
                "day_shift": petrodata.daily_shift,
            }
        )
            .then(response => {
                // console.log('data:', response.data);
                setCreditata(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, petrodata.daily_shift,base_url]);

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setShowDropdown(true); // Show dropdown when input value changes
        setSearchQuery(query);

    };

    const handleSearchVehicle = (event) => {
        const queryvehicle = event.target.value.toLowerCase();

        setShowDropdownVehicle(true); // Show dropdown when input value changes
        setSearchQueryVehicle(queryvehicle);
    };
    const handleSearchFuel = (event) => {
        const queryfuel = event.target.value.toLowerCase();
        setShowDropdownFuel(true); // Show dropdown when input value changes
        setSearchQueryFuel(queryfuel);
    };
    const handleSelectVehicle = (vehicleNumber) => {
        setSelectedVehicle(vehicleNumber);
        setEditData((prevState) => ({
            ...prevState,
            selectedVehicle: vehicleNumber
        }));
        setShowDropdownVehicle(false);
        setSearchQueryVehicle(vehicleNumber);
    };
    const handleSelectfuel = (vehicleFuel, rate) => {
        setSelectedFuel(vehicleFuel);
        setSearchQueryFuel(vehicleFuel);
        setRate(rate);
        setEditData(prevData => {
            const updatedData = {
                ...prevData,
                selectedFuel: vehicleFuel,
                rate: rate
            };

            const quantity = parseFloat(updatedData.quantity) || 0;
            const driverCash = parseFloat(updatedData.driverCash) || 0;

            const totalAmt = quantity * rate;
            const inclusiveTotal = totalAmt + driverCash;

            updatedData.totalAmt = totalAmt;
            updatedData.inclusiveTotal = inclusiveTotal;

            return updatedData;
        });
        setShowDropdownFuel(false);
        setQuantity('');
        setTotalAmt('');
        setInclusiveTotal(''); // Reset inclusive total when fuel changes

    };

    useEffect(() => {
        const total = parseFloat(totalAmt) || 0;
        const cash = parseFloat(driverCash) || 0;
        setInclusiveTotal((total + cash).toFixed(2));
    }, [totalAmt, driverCash]);

    const handleQuantityChange = (e) => {
        const quantityValue = e.target.value

        setQuantity(quantityValue);
        calculateTotalAmt(quantityValue, rate);


    };

    const calculateTotalAmt = (quantity, rate) => {
        if (!isNaN(quantity) && !isNaN(rate)) {
            const total = parseFloat(quantity) * parseFloat(rate);
            setTotalAmt(total.toFixed(2));
        } else {
            setTotalAmt('');
        }
    };


    return (

        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto bg-gray-800">
                        {/* Sidebar Links */}
                        <div className="flex items-center flex-shrink-0 px-4">
                            <img
                                className="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                alt="Your Company"
                            />
                        </div>
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-4 flex flex-col gap-6 mt-7 bg-gray-800 space-y-1">
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="bg-gray-900 text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Receipt
                                </Link>
                                <Logout />
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`lg:hidden fixed inset-0 z-40  ${showMobileMenu ? "block" : "hidden"
                    }`}
            >
                <div className="flex items-center justify-start h-full">
                    <div className="bg-gray-800 h-full w-full p-8 flex flex-col">
                        <div className="flex justify-end">
                            <button
                                onClick={toggleMobileMenu}
                                type="button"
                                className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
                                aria-controls="mobile-menu"
                                aria-expanded={showMobileMenu ? "true" : "false"}
                            >
                                <span className="sr-only">Close main menu</span>
                                {/* Close Icon */}
                                <svg
                                    className={`h-6 w-6`}
                                    xmlns="https://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-2 flex gap-7 flex-col mt-7 bg-gray-800 space-y-1">
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="bg-gray-900 text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Receipt
                                </Link>
                                <Logout />

                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* Content area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-gray-800 border-b border-gray-200 lg:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        type="button"
                        className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        aria-controls="mobile-menu"
                        aria-expanded={showMobileMenu ? "true" : "false"}
                    >
                        <span className="sr-only">Open main menu</span>
                        {/* Hamburger Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? "hidden" : "block"}`}
                            xmlns="https://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg>
                        {/* Close Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? "block" : "hidden"}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    <div className="flex flex-wrap gap-3">
                        <Button className="bg-gray-900 absolute left-0 lg:left-[85%] w-fit top-2 m-5 rounded-lg hover:bg-gray-700 text-white" onPress={onOpen}>Add Credit Sale</Button>
                    </div>
                    <Modal isOpen={isOpen} size="5xl" scrollBehavior="outside" isDismissable={false} isKeyboardDismissDisabled={true}
                        onOpenChange={onOpenChange}>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col text-2xl bg-gray-800 text-white gap-1">
                                        Add Credit Sale
                                    </ModalHeader>
                                    <form onSubmit={handleSubmit}>
                                        <ModalBody className="">

                                            {creditdata.data && (
                                                <>
                                                    <div className="mb-4 flex justify-between">
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">
                                                            Date: <span className='text-red-500 font-medium'>       {creditdata.data.DailyShift.date}</span>
                                                        </h2>
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">  Shift: <span className='text-red-500 font-medium'>  {creditdata.data.DailyShift.day_shift_no}</span></h2>
                                                    </div>
                                                </>
                                            )}
                                            <div className="grid grid-cols-1 lg:grid-cols-3  gap-3">
                                                {/* Customer */}
                                                <div className="flex flex-col gap-1">


                                                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                                                        Customer
                                                    </label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={handleSearchChange}
                                                            onClick={() => setShowDropdown(true)} // Show dropdown when input is clicked
                                                            placeholder="Search customers"
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                                                        />
                                                        {errors.selectedCustomer && <span className="text-red-500 text-sm">{errors.selectedCustomer}</span>}

                                                        {showDropdown && ( // Show dropdown only if showDropdown is true
                                                            <ul ref={dropdownRef} className="mt-1  capitalize  absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                {customerdata.length === 0 ? (
                                                                    <li className="py-2 px-3 text-gray-500">No data available</li>
                                                                ) : (
                                                                    customerdata
                                                                        .filter(item => item.Ledger.name.toLowerCase().includes(searchQuery.toLowerCase())) // Filter based on search query
                                                                        .map((item) => (
                                                                            <li key={item.Ledger.id} className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer(item)}>
                                                                                {item.Ledger.name}
                                                                            </li>
                                                                        ))
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Vehicle No. */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="vehicle">Vehicle No.</label>

                                                    <div className="mt-1 relative">
                                                        {vehicledata ? (
                                                            <>
                                                                {vehicledata.length === 0 ? (
                                                                    <input
                                                                        type="text"
                                                                        value={searchQueryVehicle}
                                                                        onChange={(e) => setSearchQueryVehicle(e.target.value)}
                                                                        placeholder="Enter vehicle manually"
                                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <input
                                                                            type="text"
                                                                            value={searchQueryVehicle}
                                                                            onChange={handleSearchVehicle}
                                                                            onClick={() => setShowDropdownVehicle(true)}
                                                                            placeholder="Search vehicle"
                                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                        />
                                                                        {showDropdownVehicle && (
                                                                            <ul ref={dropdownRef} className="mt-1 absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                                {Object.entries(vehicledata)
                                                                                    .filter(([key, value]) => key.toLowerCase().includes(searchQueryVehicle.toLowerCase()))
                                                                                    .map(([key, value]) => (
                                                                                        <li key={key} className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectVehicle(key)}>
                                                                                            {value}
                                                                                        </li>
                                                                                    ))}
                                                                            </ul>

                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={selectedVehicle}
                                                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                                                placeholder="Enter vehicle manually"
                                                                className="block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            />
                                                        )}

                                                    </div>

                                                </div>
                                                {/* Fuel Type */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="Fuel Type">Fuel Type</label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="text"
                                                            value={searchQueryFuel}
                                                            onChange={handleSearchFuel}
                                                            onClick={() => setShowDropdownFuel(true)}
                                                            placeholder="Fuel"
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                                                        />
                                                        {errors.selectedFuel && <span className="text-red-500 text-sm">{errors.selectedFuel}</span>}

                                                        {showDropdownFuel && noozleData && (
                                                            <ul ref={dropdownRef} className="mt-1 absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                {noozleData.length === 0 ? (
                                                                    <li className="py-2 px-3 text-gray-500">No data available</li>
                                                                ) : (
                                                                    noozleData
                                                                        .filter(item => item.Nozzle.Item.name.toLowerCase().includes(searchQueryFuel.toLowerCase()))
                                                                        .map((item) => (
                                                                            <li key={item.NozzlesAssign.id} className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectfuel(item.Nozzle.Item.name, item.rate)}>
                                                                                {item.Nozzle.Item.name}
                                                                            </li>
                                                                        ))
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>


                                                </div>
                                                {/* Slip No */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="slip">Slip No</label>
                                                    <input
                                                        type="text"
                                                        value={slipNo}
                                                        onChange={(e) => setSlipNo(e.target.value)}
                                                        id="slip"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />

                                                </div>
                                                {/* Coupen No */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="coupen">Coupen No</label>
                                                    <input
                                                        type="text"
                                                        value={coupenNo}
                                                        onChange={(e) => setCoupenNo(e.target.value)}
                                                        id="coupen"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                </div>

                                                {/* Quantity */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="Quantity">Quantity</label>

                                                    <input
                                                        type="number"
                                                        id="Quantity"
                                                        value={quantity}
                                                        onChange={handleQuantityChange}
                                                        disabled={!selectedFuel}
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                    {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity}</span>}

                                                </div>
                                                {/* Rate */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="rate">Rate</label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="number"
                                                            value={rate}
                                                            readOnly
                                                            placeholder="Rate"
                                                            className="block p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                                                        />
                                                    </div>
                                                </div>
                                                {/* Total Amt */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="Coupen">Total Amt</label>
                                                    <input
                                                        type="number"
                                                        value={totalAmt}
                                                        onChange={(e) => setTotalAmt(e.target.value)}
                                                        id="TOTAL AMT"
                                                        readOnly
                                                        placeholder="Total Amt"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                </div>
                                                {/* Driver Cash */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="Coupen">Driver Cash</label>
                                                    <input
                                                        type="number"
                                                        value={driverCash}
                                                        onChange={(e) => setDriverCash(e.target.value)}
                                                        id="DRIVER CASH"
                                                        placeholder="Driver Cash"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                    {errors.driverCash && <span className="text-red-500 text-sm">{errors.driverCash}</span>}

                                                </div>
                                                {/* Inclusive Total */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="Coupen">Inclusive Total</label>
                                                    <input
                                                        type="number"
                                                        value={inclusiveTotal}
                                                        readOnly
                                                        id="INCLUSIVE TOTAL"
                                                        placeholder="Inclusive Total"
                                                        className="border p-2 border-gray-300 rounded"
                                                    />
                                                </div>

                                            </div>

                                        </ModalBody>
                                        <ModalFooter>
                                            <Button className="bg-red-500 text-white" onPress={onClose}>
                                                Close
                                            </Button>
                                            <Button className="bg-gray-800 text-white" type="submit" >
                                                Submit

                                            </Button>
                                        </ModalFooter>
                                    </form>
                                </>


                            )}
                        </ModalContent>
                    </Modal>


                    <div className="m-5 grid grid-cols-1 mt-20 lg:grid-cols-2 gap-3">
                        {submittedData.map((data, index) => (
                            <div key={index} className="block  lg:max-w-3xl	 max-w-sm lg:p-6 p-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                <h5 className="lg:mb-2 mb-1 text-lg lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{data.selectedCustomer}</h5>
                                <div className="lg:my-2 my-1 grid grid-cols-2 lg:grid-cols-2 lg:gap-2 gap-1 lg:text-lg text-xs">
                                    <p className="text-gray-600 font-semibold text-sm">{data.selectedVehicle}</p>
                                    <p className="text-gray-700 font-semibold">Fuel: <span className="font-bold">{data.selectedFuel}</span> </p>
                                    <p className="text-gray-700 font-semibold">Rate: <span className="font-bold">{data.rate}</span> </p>
                                    <p className="text-gray-700 font-semibold">Quantity: <span className="font-bold">{data.quantity}</span> </p>
                                    <p className="text-gray-700 font-semibold">Total Amt: <span className="font-bold">{data.totalAmt}</span> </p>
                                    <p className="text-gray-700 font-semibold">Driver Cash: <span className="font-bold">{data.driverCash}</span> </p>
                                    <p className="text-gray-700 font-semibold">Slip No: <span className="font-bold">{data.slipNo}</span> </p>
                                    <p className="text-gray-700 font-semibold">Inclusive Total: <span className="font-bold">{data.inclusiveTotal}</span> </p>
                                </div>
                                <div className="flex flex-row justify-around mt-5">
                                    <button className=" px-2 w-10 h-10" color="primary" onClick={() => handleEdit(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.548 3.452a1.542 1.542 0 0 1 0 2.182l-7.636 7.636-3.273 1.091 1.091-3.273 7.636-7.636a1.542 1.542 0 0 1 2.182 0zM4 21h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-2 0v7H5V6h7a1 1 0 0 0 0-2H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z" fill="#000" /></svg>
                                    </button>
                                    <button className=" px-2 w-10 h-10" onClick={() => handleRemove(index)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.755 20.283 4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z" fill="#F44336" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {isEditModalOpen && (
                            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                <div className="bg-white p-6 rounded-lg">
                                    {/* Edit form */}
                                    <form onSubmit={handleSubmitEdit}>
                                        <div className="">
                                            {creditdata.data && (
                                                <>
                                                    <div className="mb-4 flex justify-between">
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">
                                                            Date: <span className='text-red-500 font-medium'>{creditdata.data.DailyShift.date}</span>
                                                        </h2>
                                                        <h2 className="block text-gray-700 text-lg font-bold mb-2">Shift: <span className='text-red-500 font-medium'>{creditdata.data.DailyShift.day_shift_no}</span></h2>
                                                    </div>
                                                </>
                                            )}
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                {/* Customer */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer</label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="text"
                                                            value={editData.selectedCustomer}
                                                            name="selectedCustomer"
                                                            onChange={handleEditChange}
                                                            onClick={() => setShowDropdown(true)} // Show dropdown when input is clicked
                                                            placeholder="Search customers"
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                                                        />
                                                        {errorss.selectedCustomer && <span className="text-red-500 text-sm">{errorss.selectedCustomer}</span>}

                                                        {showDropdown && (
                                                            <ul ref={dropdownRef} className="mt-1 absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                {customerdata.length === 0 ? (
                                                                    <li className="py-2 px-3 text-gray-500">No data available</li>
                                                                ) : (
                                                                    customerdata
                                                                        .filter(item => item.Ledger.name.toLowerCase().includes(editData.selectedCustomer.toLowerCase()))
                                                                        .map((item) => (
                                                                            <li key={item.Ledger.id} className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer(item)}>
                                                                                {item.Ledger.name}
                                                                            </li>
                                                                        ))
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Vehicle No. */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="vehicle">Vehicle No.</label>
                                                    <div className="mt-1 relative">
                                                        {vehicledata && (
                                                            <>
                                                                {vehicledata.length === 0 ? (
                                                                    <input
                                                                        type="text"
                                                                        value={editData.selectedVehicle}
                                                                        name="selectedVehicle"
                                                                        onChange={handleEditChange}
                                                                        placeholder="Enter vehicle manually"
                                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <input
                                                                            type="text"
                                                                            value={editData.selectedVehicle}
                                                                            name="selectedVehicle"
                                                                            onChange={handleEditChange}
                                                                            onClick={() => setShowDropdownVehicle(true)}
                                                                            placeholder="Search vehicle"
                                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                        />

                                                                        {showDropdownVehicle && (
                                                                            <ul ref={dropdownRef} className="mt-1 absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                                {Object.entries(vehicledata || {}) // Added null check here
                                                                                    .filter(([key, value]) => key.toLowerCase().includes((editData.selectedVehicle || '').toLowerCase())) // Added null check here
                                                                                    .map(([key, value]) => (
                                                                                        <li key={key} className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectVehicle(key)}>
                                                                                            {value}
                                                                                        </li>
                                                                                    ))}
                                                                            </ul>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                    </div>
                                                </div>


                                                {/* Fuel Type */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="Fuel Type">Fuel Type</label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="text"
                                                            value={editData.selectedFuel}
                                                            name="selectedFuel"
                                                            onChange={handleEditChange}
                                                            onClick={() => setShowDropdownFuel(true)}
                                                            placeholder="Fuel"
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                                                        />
                                                        {errorss.selectedFuel && <span className="text-red-500 text-sm">{errorss.selectedFuel}</span>}
                                                        {showDropdownFuel && noozleData && (
                                                            <ul ref={dropdownRef} className="mt-1 absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                {noozleData.length === 0 ? (
                                                                    <li className="py-2 px-3 text-gray-500">No data available</li>
                                                                ) : (
                                                                    noozleData
                                                                        .filter(item => item.Nozzle.Item.name.toLowerCase().includes(editData.selectedFuel.toLowerCase()))
                                                                        .map((item) => (
                                                                            <li key={item.NozzlesAssign.id} className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectfuel(item.Nozzle.Item.name, item.rate)}>
                                                                                {item.Nozzle.Item.name}
                                                                            </li>
                                                                        ))
                                                                )}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Slip No */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="slip">Slip No</label>
                                                    <input
                                                        type="text"
                                                        value={editData.slipNo}
                                                        name="slipNo"
                                                        onChange={handleEditChange}
                                                        id="slip"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                </div>

                                                {/* Coupen No */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="coupen">Coupen No</label>
                                                    <input
                                                        type="text"
                                                        value={editData.coupenNo}
                                                        name="coupenNo"
                                                        onChange={handleEditChange}
                                                        id="coupen"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                    {errorss.coupenNo && (
                                                        <span className="text-red-500 text-sm">{errorss.coupenNo}</span>
                                                    )}
                                                </div>

                                                {/* Quantity */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="Quantity">Quantity</label>

                                                    <input
                                                        type="number"
                                                        id="Quantity"
                                                        value={editData.quantity}
                                                        name="quantity"
                                                        onChange={handleEditChange}
                                                        disabled={!editData.selectedFuel}
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                    {errorss.quantity && <span className="text-red-500 text-sm">{errorss.quantity}</span>}

                                                </div>

                                                {/* Rate */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="rate">Rate</label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="number"
                                                            value={editData.rate}
                                                            name="rate"
                                                            readOnly
                                                            placeholder="Rate"
                                                            className="block p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                                                        />

                                                    </div>
                                                </div>

                                                {/* Total Amt */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="totalAmt">Total Amt</label>
                                                    <input
                                                        type="number"
                                                        value={editData.totalAmt}
                                                        name="totalAmt"
                                                        readOnly
                                                        onChange={(e) => setTotalAmt(e.target.value)}
                                                        id="TOTAL AMT"
                                                        placeholder="Total Amt"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />

                                                </div>

                                                {/* Driver Cash */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="driverCash">Driver Cash</label>
                                                    <input
                                                        type="number"
                                                        value={editData.driverCash}
                                                        name="driverCash"
                                                        onChange={handleEditChange}
                                                        id="DRIVER CASH"
                                                        placeholder="Driver Cash"
                                                        className="border p-2 border-gray-300 rounded"

                                                    />
                                                    {errorss.driverCash && <span className="text-red-500 text-sm">{errorss.driverCash}</span>}

                                                </div>

                                                {/* Inclusive Total */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="inclusiveTotal">Inclusive Total</label>
                                                    <input
                                                        type="number"

                                                        value={editData.inclusiveTotal}
                                                        name="inclusiveTotal"
                                                        readOnly
                                                        id="INCLUSIVE TOTAL"
                                                        placeholder="Inclusive Total"
                                                        className="border p-2 border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>

                                        </div>

                                        <div className="flex flex-row gap-5 mt-5">
                                            <Button color="primary" type="submit">Save</Button>
                                            <Button color="danger" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}



                    </div>
                </main >
            </div >
        </div >
    );
}

export default CreditSale;
