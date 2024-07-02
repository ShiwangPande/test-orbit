import { useState, useRef } from "react";
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
import add from "../images/add.svg"
import { useMediaQuery } from 'react-responsive';


import React from "react";

function CreditSale({ petrodata }) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [creditdata, setCreditData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryVehicle, setSearchQueryVehicle] = useState("");
    const [searchQueryFuel, setSearchQueryFuel] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedFuel, setSelectedFuel] = useState(null);
    const [vehicledata, setVehicledata] = useState([])
    const [ItemName, setItemName] = useState([])
    const [customerdata, setCustomerdata] = useState([])
    const [ledgerId, setLedgerId] = useState(null); // New state for ledger ID
    const [noozleData, setNoozleData] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false); // State to toggle the dropdown visibility
    const [showDropdownVehicle, setShowDropdownVehicle] = useState(false); // State to toggle the dropdown visibility
    const [showDropdownFuel, setShowDropdownFuel] = useState(false); // State to toggle the dropdown visibility
    const [rate, setRate] = useState(''); // State to toggle the dropdown visibility
    const [quantity, setQuantity] = useState('');
    const [totalAmt, setTotalAmt] = useState('');
    const [sgst, setSgst] = useState("");
    const [cgst, setCgst] = useState("");
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
        cgst: 0,
        sgst: 0,
        totalAmt: 0,
        driverCash: 0,
        inclusiveTotal: 0
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Function to open edit modal and populate with data
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    const base_url = process.env.REACT_APP_API_URL;
    // Function to handle changes in edit modal
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = parseFloat(value);

        setEditData(prevData => {
            let updatedData = { ...prevData };
            let errorss = { ...errors };

            // Update the value in updatedData
            updatedData[name] = value;

            // Update rate when fuel type changes
            if (name === 'selectedFuel') {
                const selectedNoozleData = noozleData.find(item => item.Nozzle.Item.name.toLowerCase() === value.toLowerCase());
                const selectedItemData = ItemName.find(item => item.Item.name.toLowerCase() === value.toLowerCase());

                if (selectedNoozleData || selectedItemData) {
                    updatedData.rate = selectedNoozleData.rate;
                    updatedData.mrp = selectedItemData.mrp;
                } else {
                    updatedData.rate = 0;
                    updatedData.mrp = 0;
                }
            }

            // Handle rate change
            if (name === 'rate') {
                if (!isNaN(parsedValue)) {
                    updatedData.rate = value;
                    updatedData.totalAmt = (updatedData.quantity * value).toFixed(2);
                }
            }

            // Reset selectedVehicle when editing selectedCustomer
            if (name === 'selectedCustomer') {
                updatedData.selectedCustomer = value;
                updatedData.selectedVehicle = ''; // Reset selectedVehicle when editing selectedCustomer
                if (selectedCustomer !== searchQuery) {
                    errorss.selectedCustomer = "Invalid customer name";
                }
                errorss.selectedCustomer = "Invalid customer name";
            }

            // Handle total amount change
            if (name === 'totalAmt') {
                if (!isNaN(parsedValue)) {
                    const potentialQuantity = parseFloat(parsedValue) / parseFloat(updatedData.rate);
                    if (parsedValue <= 0) {
                        errorss.driverCash = "Total amount must be greater than 0";
                    }
                    if (potentialQuantity > 20000) {
                        updatedData.totalAmt = (20000 * parseFloat(updatedData.rate));
                        updatedData.quantity = (updatedData.totalAmt / parseFloat(updatedData.rate));
                        errorss.totalAmt = "Total amount results in quantity exceeding 20,000";
                    } else {
                        errorss.totalAmt = "";
                        updatedData.quantity = potentialQuantity.toFixed(2); // Round to 2 decimal places
                    }
                }
            }

            // Handle quantity change
            if (name === 'quantity') {
                if (!isNaN(parsedValue)) {
                    if (parsedValue > 20000) {
                        updatedData.quantity = 20000;
                        errorss.quantity = "Quantity cannot exceed 20,000";
                    } else {
                        errorss.quantity = "";
                        updatedData.quantity = parsedValue.toFixed(2);
                    }
                    // Update total amount based on new quantity
                    updatedData.totalAmt = (updatedData.quantity * updatedData.rate).toFixed(2); // Round to 2 decimal places
                }
            }

            // Handle driverCash change
            if (name === 'driverCash') {
                if (!isNaN(parsedValue)) {
                    if (parsedValue <= 0) {
                        errorss.driverCash = "Driver cash cannot be negative";
                    } else if (parsedValue > 10000000) {
                        updatedData.driverCash = 10000000;
                        errorss.driverCash = "Driver cash cannot exceed 10,000,000";
                    } else {
                        errorss.driverCash = "";
                        updatedData.driverCash = parsedValue;
                    }
                }
            }

            // Calculate CGST and SGST amounts
            const total = parseFloat(updatedData.totalAmt) || 0;
            const cash = parseFloat(updatedData.driverCash) || 0;
            const cgstItem = ItemName.find(item => item.GstMaster.cgst !== null);
            const sgstItem = ItemName.find(item => item.GstMaster.sgst !== null);
            const cgstPercentage = parseFloat(cgstItem?.GstMaster?.cgst) || 0;
            const sgstPercentage = parseFloat(sgstItem?.GstMaster?.sgst) || 0;

            const cgstAmount = total * (cgstPercentage / 100);
            const sgstAmount = total * (sgstPercentage / 100);

            updatedData.cgst = cgstAmount.toFixed(2);
            updatedData.sgst = sgstAmount.toFixed(2);

            // Calculate inclusive total based on customer selection
            let inclusiveTotal = 0;
            if (selectedFuel === 'HSD' || selectedFuel === 'MS') {
                inclusiveTotal = (total + cash).toFixed(2);
            } else {
                inclusiveTotal = (total + cash - cgstAmount - sgstAmount).toFixed(2);
            }

            updatedData.inclusiveTotal = inclusiveTotal;

            // Update the corresponding state variables for UI
            if (name === 'totalAmt' || name === 'quantity' || name === 'rate' || name === 'driverCash') {
                setQuantity(updatedData.quantity);
                setTotalAmt(updatedData.totalAmt);
                setCgst(updatedData.cgst);
                setSgst(updatedData.sgst);
                setInclusiveTotal(updatedData.inclusiveTotal);
            }

            setErrors(errorss);

            return updatedData;
        });
    };



    const validateEditForm = () => {
        const newErrors = {};

        // Check if selectedCustomer is null or empty
        if (!editData.selectedCustomer || editData.selectedCustomer.trim() === '') {
            newErrors.selectedCustomer = 'Customer is required';
        }
        if (!editData.selectedCustomer) {
            errorss.selectedCustomer = "Invalid customer name";
        }
        // if (editData.searchQuery !== editData.selectedCustomer) {
        //     newErrors.selectedCustomer = 'Customer is invalid';
        // }
        // Check if selectedFuel is null or empty
        if (!editData.selectedFuel || editData.selectedFuel.trim() === '') {
            newErrors.selectedFuel = 'Fuel type is required';
        }

        if (String(editData.searchQueryVehicle).length !== 10) {
            errorss.searchQueryVehicle = 'vehicle number invalid';
        }
        // Check if quantity is not a positive number
        if (!editData.quantity || editData.quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0';
        } else if (editData.quantity > 20000) {
            newErrors.quantity = 'Quantity cannot exceed 20,000';
        }
        if (!editData.totalAmt || editData.totalAmt <= 0) {
            newErrors.totalAmt = 'Total Amount must be greater than 0';
        }

        // Check if driverCash is negative only if a vehicle is selected
        if (editData.selectedVehicle && parseFloat(editData.driverCash) < 0) {
            newErrors.driverCash = 'Driver cash cannot be negative';
        } else if (parseFloat(editData.driverCash) > 10000000) {

            newErrors.driverCash = 'Driver cash cannot exceed 10,000,000';
        }
        if (parseFloat(editData.driverCash) === 0) {
            newErrors.driverCash = 'cannot be zero';

        }

        // if (0 < editData.selectedVehicle.length || editData.selectedVehicle.length !== 10) {
        //     newErrors.selectedVehicle = 'Invalid Vehicle Number'
        // }

        // Check if driverCash is greater than 0 and no vehicle is selected
        if (parseFloat(editData.driverCash) >= 0 && !editData.selectedVehicle) {
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

        if (!selectedCustomer) {
            newErrors.selectedCustomer = 'Customer is required';
        }
        if (searchQuery !== selectedCustomer) {
            newErrors.selectedCustomer = 'Customer is required';
        }

        // Check if selectedVehicle is required based on your requirement
        // if (!selectedVehicle) {
        //     newErrors.selectedVehicle = 'Vehicle is required';
        // }
        if (!selectedFuel) {
            newErrors.selectedFuel = 'Fuel type is required';
        }
        if (quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0';
        }
        if (!quantity) {
            newErrors.quantity = 'Quantity is required';
        }

        const vehicleToUse = selectedVehicle || searchQueryVehicle.trim();

        // Validate driverCash as before
        const parsedDriverCash = parseFloat(driverCash);

        if (parsedDriverCash < 0) {
            newErrors.driverCash = 'Driver Cash cannot be negative';
        } else if (parsedDriverCash > 10000000) {
            newErrors.driverCash = 'Driver Cash cannot exceed 10,000,000';
        } else if (parsedDriverCash >= 0 && !vehicleToUse) {
            newErrors.driverCash = 'If driver cash is greater than 0, a vehicle must be selected or entered manually';
        }

        // Optionally, if you want to update the state or errors immediately:
        setErrors(newErrors);



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Validate the form inputs
        if (validateForm()) {
            const newData = {
                selectedVehicle: selectedVehicle || searchQueryVehicle.trim(), // Use manually entered vehicle if selectedVehicle is empty
                selectedCustomer,
                selectedFuel,
                rate,
                quantity,
                totalAmt,
                driverCash,
                inclusiveTotal,
                slipNo,
                cgst,
                sgst,
                coupenNo,
            };

            // Update or add the new data to localStorage
            const existingData = JSON.parse(localStorage.getItem('submittedData')) || [];

            if (editingIndex !== null && editingIndex !== undefined) {
                existingData[editingIndex] = newData; // Update existing data if editing
            } else {
                existingData.push(newData); // Add new data if not editing
            }

            // Save updated data back to localStorage
            localStorage.setItem('submittedData', JSON.stringify(existingData));

            // Update state variables and UI after successful submission
            setSubmittedData(existingData);
            setSelectedVehicle('');
            setSelectedCustomer('');

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
            setCgst('');
            setSgst('');
            console.log('Form submitted successfully');
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
            `${base_url}/assignNozzleList/1`,
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
        axios.post(`${base_url}/getSundryDebtorsLedgerList/1`, {
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
            axios.post(`${base_url}/customervehList/1`, {
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
        if (selectedCustomer !== 'Cash') {
            // Reset to default rate
            const selectedNoozleItem = noozleData.find(item => item.Nozzle.Item.name === selectedFuel);
            const selectedItem = ItemName.find(item => item.Item.name === selectedFuel);
            const defaultRate = selectedNoozleItem ? selectedNoozleItem.rate : (selectedItem ? selectedItem.Item.mrp : '');
            setRate(defaultRate);
        } else {
            setRate(''); // Reset rate if no fuel is selected
        }
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
    const handleClear = () => {
        // Reset all related states to their initial values
        setSelectedCustomer("");
        setLedgerId("");
        setSearchQuery("");
        setSearchQueryVehicle("");
        setSelectedVehicle(null); // Ensure this is cleared properly
        setShowDropdown(true); // Show the dropdown again

        // Reset the rate to default (or empty if no default is set)
        const selectedNoozleItem = noozleData.find(item => item.Nozzle.Item.name === selectedFuel);
        const selectedItem = ItemName.find(item => item.Item.name === selectedFuel);
        const defaultRate = selectedNoozleItem ? selectedNoozleItem.rate : (selectedItem ? selectedItem.Item.mrp : '');
        setRate(defaultRate || ''); // Reset to default rate or empty string

        // Clear the edit data related to the customer
        setEditData((prevState) => ({
            ...prevState,
            selectedCustomer: ""
        }));
    };

    useEffect(() => {
        axios.post(`${base_url}/getSundryDebtorsLedgerList/1`, {
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
        axios.post(`${base_url}/customervehList/1`, {
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
        axios.post(`${base_url}/searchItemByName/1`, {
            "petro_id": petrodata.petro_id,
        })
            .then(response => {
                console.log("setItemName", response.data.data);
                setItemName(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, base_url]);


    useEffect(() => {
        axios.post(
            `${base_url}/empcurrentShiftData/7/24/1`,
            {
                shift: 11,
                emp_id: "24",
                date: "2024-04-11",
                petro_id: petrodata.petro_id,
                day_shift: petrodata.daily_shift,
            }
        )
            .then(response => {
                const { shift, day_shift_no, date } = response.data.data.DailyShift;
                const formattedDate = formatDate(date);
                setCreditData({ shift, day_shift_no, date: formattedDate });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [petrodata.petro_id, petrodata.daily_shift, base_url]);
    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setShowDropdown(true); // Show dropdown when input value changes
        setSearchQuery(query);


    };
    const handleSearchVehicle = (event) => {
        const queryVehicle = event.target.value.toLowerCase();
        setSearchQueryVehicle(queryVehicle);
        setShowDropdownVehicle(true); // Show dropdown when input value changes
    };

    const handleSelectVehicle = (vehicleNumber) => {
        setSelectedVehicle(vehicleNumber);
        setEditData((prevState) => ({
            ...prevState,
            selectedVehicle: vehicleNumber,
            SearchQueryVehicle: vehicleNumber
        }));
        setShowDropdownVehicle(false);
        setSearchQueryVehicle(vehicleNumber);
    };

    const handleSearchFuel = (event) => {
        const queryfuel = event.target.value.toLowerCase();
        setShowDropdownFuel(true); // Show dropdown when input value changes
        setSearchQueryFuel(queryfuel);
    };
    useEffect(() => {
        if (Array.isArray(noozleData) && noozleData.length > 0) {
            const hsdItem = noozleData.find(item => item.Nozzle.Item.name === 'HSD');
            if (hsdItem) {
                setSelectedFuel('HSD');
                setRate(hsdItem.rate);
                setEditData(prevData => ({
                    ...prevData,
                    selectedFuel: 'HSD',
                    rate: hsdItem.rate
                }));
            }
        }
    }, [noozleData]);


    const handleSelectfuel = (selectedValue) => {
        const selectedNoozleItem = noozleData.find(item => item.Nozzle.Item.name === selectedValue);
        const selectedItem = ItemName.find(item => item.Item.name === selectedValue);
        const rate = selectedNoozleItem ? selectedNoozleItem.rate : (selectedItem ? selectedItem.Item.mrp : '');

        if (selectedNoozleItem || selectedItem) {
            setSelectedFuel(selectedValue);
            setRate(rate);

            setEditData(prevData => ({
                ...prevData,
                selectedFuel: selectedValue,
                rate: selectedNoozleItem ? selectedNoozleItem.rate : '',
                mrp: selectedItem ? selectedItem.Item.mrp : ''
            }));

            // Recalculate only the total amount based on the current quantity and new rate
            calculateTotalAmt(quantity, rate, selectedItem ? selectedItem.Item.mrp : '');
        }

        setShowDropdownFuel(false);
    };



    // useEffect(() => {
    //     const total = parseFloat(totalAmt) || 0;
    //     const cash = parseFloat(driverCash) || 0;
    //     setInclusiveTotal((total + cash).toFixed(2));
    // }, [totalAmt, driverCash]);

    useEffect(() => {
        const total = parseFloat(totalAmt) || 0;
        const cash = parseFloat(driverCash) || 0;
        const cgstItem = ItemName.find(item => item.GstMaster.cgst !== null);
        const sgstItem = ItemName.find(item => item.GstMaster.sgst !== null);
        const cgstPercentage = parseFloat(cgstItem?.GstMaster?.cgst) || 0;
        const sgstPercentage = parseFloat(sgstItem?.GstMaster?.sgst) || 0;
        const gstItem = ItemName.find(item => item.GstMaster.gst_percentage !== null);
        const gst_percentage = parseFloat(gstItem?.GstMaster?.gst_percentage) || 0;
        // Calculate CGST and SGST amounts
        let cgstAmount = 0;
        let sgstAmount = 0;

        const baseAmount = (total * gst_percentage) / (100 + gst_percentage)
        // If customer is 'Cash', calculate only CGST and SGST

        cgstAmount = baseAmount / 2;
        sgstAmount = baseAmount / 2;


        // Calculate inclusive total based on customer selection
        let inclusiveTotal = 0;
        if (selectedFuel === 'HSD' || selectedFuel === 'MS') {
            // Otherwise, add cash amount to total
            const cash = parseFloat(driverCash) || 0;
            inclusiveTotal = (total + cash).toFixed(2);

        } else {
            inclusiveTotal = (total + cash - cgstAmount - sgstAmount).toFixed(2);
        }

        setInclusiveTotal(inclusiveTotal);
    }, [totalAmt, driverCash, ItemName, selectedFuel]);

    useEffect(() => {
        const cgstItem = ItemName.find(item => item.GstMaster.cgst !== null);
        const sgstItem = ItemName.find(item => item.GstMaster.sgst !== null);
        const gstItem = ItemName.find(item => item.GstMaster.gst_percentage !== null);


        if (cgstItem) {
            // const cgstPercentage = parseFloat(cgstItem.GstMaster.cgst) || 0;
            const gst_percentage = parseFloat(gstItem?.GstMaster?.gst_percentage) || 0;
            const total = parseFloat(totalAmt) || 0;
            const precalculatedCgst = (total * gst_percentage) / (100 + gst_percentage);
            const calculatedCgst = precalculatedCgst / 2;
            setCgst(calculatedCgst.toFixed(2));
        } else {
            setCgst(0); // Handle case when no item with cgst is found
        }
        if (sgstItem) {
            const gst_percentage = parseFloat(gstItem?.GstMaster?.gst_percentage) || 0;
            const total = parseFloat(totalAmt) || 0;
            const precalculatedCgst = (total * gst_percentage) / (100 + gst_percentage);
            const calculatedCgst = precalculatedCgst / 2;
            setSgst(calculatedCgst.toFixed(2));
        } else {
            setSgst(0); // Handle case when no item with cgst is found
        }

    }, [totalAmt, ItemName]);


    const handleQuantityChange = (e) => {
        let quantityValue = parseFloat(e.target.value);

        if (isNaN(quantityValue)) {
            quantityValue = ''; // Reset quantityValue if NaN (non-numeric input)
        } else if (quantityValue > 20000) {
            quantityValue = 20000;
            setErrors((prev) => ({ ...prev, quantity: 'Quantity cannot exceed 20,000' }));
        } else {
            setErrors((prev) => ({ ...prev, quantity: '' }));
        }

        setQuantity(quantityValue);
        calculateTotalAmt(quantityValue, rate, editData.mrp);
    };



    const handleTotalAmtChange = (e) => {
        let totalAmtValue = e.target.value;
        const potentialQuantity = parseFloat(totalAmtValue) / parseFloat(rate || editData.mrp);
        if (potentialQuantity > 20000) {
            totalAmtValue = 20000 * (rate || editData.mrp);
            setErrors((prev) => ({ ...prev, totalAmt: 'Total amount results in quantity exceeding 20,000' }));
        } else {
            setErrors((prev) => ({ ...prev, totalAmt: '' }));
        }
        setTotalAmt(totalAmtValue);
        calculateQuantity(totalAmtValue, rate);
    };

    const handleDriverCashChange = (e) => {
        let driverCashValue = e.target.value;
        if (driverCashValue > 10000000) {
            driverCashValue = 10000000;
            setErrors((prev) => ({ ...prev, driverCash: 'Driver Cash results in quantity exceeding 10,000,000' }));
        } else {
            setErrors((prev) => ({ ...prev, driverCash: '' }));
        }
        setDriverCash(driverCashValue);
    };


    const calculateTotalAmt = (quantity, rate) => {
        const effectiveRate = rate || editData.mrp;
        if (!isNaN(quantity) && !isNaN(effectiveRate)) {
            const total = parseFloat(quantity) * parseFloat(effectiveRate);
            const gstAmount = (total * (sgst + cgst)) / (100 + sgst + cgst);
            const inclusiveTotal = total - gstAmount;
            setTotalAmt(total.toFixed(2));
            setInclusiveTotal(inclusiveTotal.toFixed(2));
        } else {
            setTotalAmt('');
            setInclusiveTotal('');
        }
    };

    const calculateQuantity = (total, rate) => {
        const effectiveRate = rate || editData.mrp;
        if (!isNaN(total) && !isNaN(effectiveRate)) {
            let quantity = parseFloat(total) / parseFloat(effectiveRate);
            if (quantity > 20000) {
                quantity = 20000;
                setErrors((prev) => ({ ...prev, quantity: 'Quantity cannot exceed 20,000' }));
            } else {
                setErrors((prev) => ({ ...prev, quantity: '' }));
            }
            setQuantity(quantity.toFixed(2));
        } else {
            setQuantity('');
        }
    };


    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [swipeStates, setSwipeStates] = useState(Array(submittedData.length).fill({ isSwipedRight: false, isSwipedLeft: false }));
    const containerRef = useRef(null);
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            setDragConstraints({
                left: -containerWidth / 4,  // Adjust this value based on your swipe threshold
                right: containerWidth / 4,  // Adjust this value based on your swipe threshold
            });
        }
    }, [submittedData.length]); // Dependency array to update when data length changes

    const handleDragEnd = (index, event, info) => {
        if (isMobile) {
            const updatedSwipeStates = [...swipeStates];
            const swipeThreshold = containerRef.current.offsetWidth / 4; // Adjust this threshold dynamically based on container width

            if (info.point.x > swipeThreshold) {
                updatedSwipeStates[index] = { isSwipedRight: true, isSwipedLeft: false };
            } else if (info.point.x < -swipeThreshold) {
                updatedSwipeStates[index] = { isSwipedRight: false, isSwipedLeft: true };
            } else {
                updatedSwipeStates[index] = { isSwipedRight: false, isSwipedLeft: false };
            }

            setSwipeStates(updatedSwipeStates);
        }
    };

    const handleCardClick = (index) => {
        const updatedSwipeStates = [...swipeStates];
        updatedSwipeStates[index] = { isSwipedRight: false, isSwipedLeft: false };
        setSwipeStates(updatedSwipeStates);
    };

    return (

        <div className="h-full  min-h-screen flex overflow-hidden  bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 ">

            <Navbar petrodata={petrodata} />

            <main className="flex-1 relative z-0  overflow-y-auto focus:outline-none">

                <div className="flex flex-wrap gap-3">
                    <Button className="bg-navbar fixed z-50 w-16 max-w-none min-w-16 h-16 border-2 p-0 border-white right-0   bottom-0 m-5 rounded-full hover:invert text-white" onPress={onOpen}>
                        <img src={add} className="w-8 h-8" alt="" />
                    </Button>
                </div>
                <Modal isOpen={isOpen} size="5xl" scrollBehavior="outside" isDismissable={false} isKeyboardDismissDisabled={true} placement="top"
                    onOpenChange={onOpenChange}>
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
                                                    Date: <span className='text-red-500 font-medium'>        {creditdata.date}</span>
                                                </h2>
                                                <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">  Shift: <span className='text-red-500 font-medium'>  {creditdata.day_shift_no}</span></h2>
                                            </div>
                                        </>


                                        {/* Customer */}
                                        <div className="grid grid-cols-2 lg:grid-cols-3  gap-3">
                                            {/* Customer */}
                                            <div className="flex flex-col col-span-2 lg:col-span-1 gap-1">


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
                                                    {selectedCustomer && (
                                                        <button
                                                            onClick={handleClear}
                                                            className="absolute top-1 w-8 h-8 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1"
                                                        >
                                                            &#x2715;
                                                        </button>
                                                    )}
                                                    {showDropdown && (
                                                        <ul ref={dropdownRef} className="mt-1 capitalize absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                            <li key="cash-option" className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer({ Ledger: { id: 'cash', name: 'Cash' } })}>
                                                                Cash
                                                            </li>
                                                            {customerdata.length === 0 ? (
                                                                <li className="py-2 px-3 text-gray-500">No data available</li>
                                                            ) : (
                                                                customerdata
                                                                    .filter(item => item.Ledger.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                                                                    maxLength="10"
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
                                                            maxLength="10"
                                                        />
                                                    )}

                                                </div>

                                            </div>

                                            {/* Fuel Type */}
                                            <div className="flex flex-col col-span-1 gap-1">
                                                <label htmlFor="itemOrFuelType">{selectedCustomer === 'Cash' ? 'Item' : 'Fuel Type'}</label>
                                                <div className="mt-1 relative">
                                                    <select
                                                        id="itemOrFuelType"
                                                        value={selectedFuel}
                                                        onChange={(e) => handleSelectfuel(e.target.value)}
                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    >
                                                        <option value="">Select {selectedCustomer === 'Cash' ? 'Item' : 'Fuel'}</option>
                                                        {selectedCustomer !== 'Cash' && (
                                                            <>
                                                                {noozleData.map((item) => (

                                                                    <option key={item.NozzlesAssign.id} value={item.Nozzle.Item.name}>
                                                                        {item.Nozzle.Item.name}
                                                                    </option>

                                                                ))

                                                                }
                                                            </>)}
                                                        {ItemName.map((item) => (
                                                            <option key={item.Item.id} value={item.Item.name}>
                                                                {item.Item.name}
                                                            </option>
                                                        ))
                                                        }
                                                    </select>
                                                    {/* {selectedCustomer} */}
                                                    {errors.selectedFuel && <span className="text-red-500 text-sm">{errors.selectedFuel}</span>}
                                                </div>
                                            </div>



                                            {/* Slip No */}
                                            <div className="flex flex-col col-span-1  gap-1">
                                                <label htmlFor="slip">Slip No</label>
                                                <input
                                                    type="text"
                                                    value={slipNo}
                                                    onChange={(e) => setSlipNo(e.target.value)}
                                                    id="slip"
                                                    className="border p-2 border-gray-300 rounded"
                                                    maxLength={5}
                                                />

                                            </div>
                                            {/* Coupen No */}
                                            <div className="flex flex-col col-span-1  gap-1">
                                                <label htmlFor="coupen">Coupen No</label>
                                                <input
                                                    type="text"
                                                    value={coupenNo}
                                                    onChange={(e) => setCoupenNo(e.target.value)}
                                                    id="coupen"
                                                    className="border p-2 border-gray-300 rounded"
                                                    maxLength={5}
                                                />
                                            </div>
                                            {/* rate */}
                                            <div className="flex flex-col col-span-1 gap-1">
                                                <label htmlFor="rate">Rate</label>
                                                <div className="mt-1 relative">
                                                    <input
                                                        type="number"
                                                        value={rate}
                                                        readOnly={selectedFuel === 'HSD' || selectedFuel === 'MS'}
                                                        disabled={selectedFuel === 'HSD' || selectedFuel === 'MS'}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value.length <= 7) {
                                                                setRate(value);
                                                                // Recalculate the total amount based on the new rate
                                                                calculateTotalAmt(quantity, value, editData.mrp);
                                                            }
                                                        }}
                                                        placeholder="Rate"
                                                        className="block p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>


                                            {/* Quantity */}
                                            <div className="flex flex-col col-span-1  gap-1">
                                                <label htmlFor="Quantity">Quantity</label>
                                                <input
                                                    type="number"
                                                    id="Quantity"
                                                    value={quantity}
                                                    onChange={handleQuantityChange}
                                                    disabled={!selectedFuel}
                                                    className="border p-2 border-gray-300 rounded"
                                                // required
                                                />
                                                {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity}</span>}
                                            </div>


                                            {/* Total Amt */}
                                            <div className="flex flex-col col-span-1 gap-1">
                                                <label htmlFor="Coupen">Total Amount</label>
                                                <input
                                                    type="number"
                                                    value={totalAmt}
                                                    onChange={handleTotalAmtChange}
                                                    disabled={!selectedFuel}
                                                    id="TOTAL AMT"
                                                    placeholder="Total Amt"
                                                    className="border p-2 border-gray-300 rounded"
                                                />
                                                {errors.totalAmt && <span className="text-red-500 text-sm">{errors.totalAmt}</span>}

                                            </div>
                                            <div className="flex flex-col col-span-1  gap-1">
                                                <label htmlFor="Coupen">Driver Cash</label>
                                                <input
                                                    type="number"
                                                    value={driverCash}
                                                    onChange={handleDriverCashChange}
                                                    id="DRIVER CASH"
                                                    placeholder="Driver Cash"
                                                    className="border p-2 border-gray-300 rounded"


                                                />
                                                {errors.driverCash && <span className="text-red-500 text-sm">{errors.driverCash}</span>}

                                            </div>
                                            {(selectedFuel !== 'HSD' && selectedFuel !== 'MS') &&
                                                <div className="flex flex-col col-span-1  gap-1">
                                                    <label htmlFor="sgst">SGST</label>
                                                    <input
                                                        type="number"
                                                        id="sgst"
                                                        value={sgst}
                                                        readOnly
                                                        className="border p-2 border-gray-300 rounded"
                                                    // required
                                                    />
                                                    {errors.sgst && <span className="text-red-500 text-sm">{errors.sgst}</span>}
                                                </div>

                                            }

                                            {(selectedFuel !== 'HSD' && selectedFuel !== 'MS') &&
                                                <div className="flex flex-col col-span-1  gap-1">
                                                    <label htmlFor="cgst">CGST</label>
                                                    <input
                                                        type="number"
                                                        id="cgst"
                                                        value={cgst}
                                                        readOnly
                                                        className="border p-2 border-gray-300 rounded"
                                                    // required
                                                    />
                                                    {errors.cgst && <span className="text-red-500 text-sm">{errors.cgst}</span>}
                                                </div>

                                            }
                                            {/* Driver Cash */}

                                            {/* Inclusive Total */}
                                            <div className="flex flex-col col-span-2 lg:col-span-1 gap-1">
                                                <label htmlFor="Coupen">Inclusive Total</label>
                                                <input
                                                    type="number"
                                                    value={inclusiveTotal}
                                                    readOnly
                                                    id="INCLUSIVE TOTAL"
                                                    placeholder="Inclusive Total"
                                                    disabled
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

                {!isEditModalOpen && (
                    <div className='w-[90vw] lg:w-[80.5vw] bg-navbar lg:fixed relative lg:mt-5 mt-16 mx-5  rounded-md px-8 py-5 '><div className="  flex justify-between">


                        <h2 className="block    text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                            Date: <span className='text-red-500 font-medium'>        {creditdata.date}</span>
                        </h2>
                        <h2 className="block   text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">  Shift: <span className='text-red-500 font-medium'>  {creditdata.day_shift_no}</span></h2>
                    </div>
                    </div>
                )}
                <div className=" mt-5 mx-5 grid grid-cols-1 lg:mt-28 lg:grid-cols-2 gap-3 lg:gap-5">
                    {submittedData.map((data, index) => (
                        data?.selectedCustomer && (
                            <div key={index} ref={containerRef} className="relative justify-center flex flex-row overflow-hidden">
                                {isMobile && (
                                    <>
                                        {swipeStates[index] && swipeStates[index].isSwipedRight && (
                                            <button className="h-full flex flex-row rounded-lg bg-navbar justify-around" onClick={() => handleEdit(index)}>
                                                <div className="px-2 w-10 h-10 my-auto" color="primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                        <path d="M20.548 3.452a1.542 1.542 0 0 1 0 2.182l-7.636 7.636-3.273 1.091 1.091-3.273 7.636-7.636a1.542 1.542 0 0 1 2.182 0zM4 21h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-2 0v7H5V6h7a1 1 0 0 0 0-2H4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1z" fill="#fff" />
                                                    </svg>
                                                </div>
                                            </button>
                                        )}
                                    </>
                                )}

                                <motion.div
                                    className="flex select-none flex-col justify-between lg:max-w-3xl max-w-sm lg:p-4 p-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                                    initial={{ x: 0 }}
                                    animate={{ x: (swipeStates[index]?.isSwipedLeft ? -10 : swipeStates[index]?.isSwipedRight ? 10 : 0) }}
                                    drag={isMobile ? "x" : false}
                                    dragConstraints={dragConstraints}
                                    onDragEnd={(event, info) => handleDragEnd(index, event, info)}
                                    onClick={() => handleCardClick(index)} // Added onClick handler
                                >
                                    <h5 className="lg:mb-2 mb-1 text-lg lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {data.selectedCustomer}
                                    </h5>
                                    <div className="lg:my-2 my-1 grid grid-cols-2 lg:grid-cols-2 lg:gap-2 gap-1 lg:text-lg text-xs">
                                        {data.selectedVehicle && <p className="text-orrange font-semibold text-base">{data.selectedVehicle}</p>}
                                        {data.selectedFuel && <p className="text-gray-700 font-semibold">Fuel: <span className="font-bold">{data.selectedFuel}</span></p>}
                                        {data.rate && <p className="text-gray-700 font-semibold">Rate: <span className="font-bold">{data.rate}</span></p>}
                                        {data.quantity && <p className="text-gray-700 font-semibold">Quantity: <span className="font-bold">{data.quantity}</span></p>}
                                        {data.totalAmt && <p className="text-gray-700 font-semibold">Total Amt: <span className="font-bold">{data.totalAmt}</span></p>}
                                        {data.driverCash && <p className="text-gray-700 font-semibold">Driver Cash: <span className="font-bold">{data.driverCash}</span></p>}
                                        {data.slipNo && <p className="text-gray-700 font-semibold">Slip No: <span className="font-bold">{data.slipNo}</span></p>}
                                        {data.coupenNo && <p className="text-gray-700 font-semibold">Coupen No: <span className="font-bold">{data.coupenNo}</span></p>}
                                        {data.inclusiveTotal && <p className="text-gray-700 font-semibold">Inclusive Total: <span className="font-bold">{data.inclusiveTotal}</span></p>}
                                    </div>

                                    {!isMobile && (
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
                                    )}
                                </motion.div>
                                {isMobile && (
                                    <>
                                        {swipeStates[index] && swipeStates[index].isSwipedLeft && (
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

                            </div>
                        )
                    ))}

                    {isEditModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                            <div className="rounded-lg">
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
                                                        {errors.selectedCustomer && <span className="text-red-500 text-sm">{errors.selectedCustomer}</span>}
                                                        {selectedCustomer && (
                                                            <button
                                                                onClick={handleClear}
                                                                className="absolute top-1 w-8 h-8 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1"
                                                            >
                                                                &#x2715;
                                                            </button>
                                                        )}

                                                        {showDropdown && (
                                                            <ul ref={dropdownRef} className="mt-1 capitalize absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                <li key="cash-option" className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer({ Ledger: { id: 'cash', name: 'Cash' } })}>
                                                                    Cash
                                                                </li>
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
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="vehicle">Vehicle No.</label>
                                                    <div className="mt-1 relative">
                                                        {vehicledata ? (
                                                            <>
                                                                {vehicledata.length === 0 ? (
                                                                    <input
                                                                        type="text"
                                                                        value={editData.SearchQueryVehicle}
                                                                        name="SearchQueryVehicle"
                                                                        onChange={handleEditChange}
                                                                        placeholder="Enter vehicle manually"
                                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                        maxLength="10"
                                                                    />

                                                                ) : (
                                                                    <>
                                                                        <input
                                                                            type="text"
                                                                            value={editData.selectedVehicle}
                                                                            onChange={handleEditChange}
                                                                            onClick={() => setShowDropdownVehicle(true)}
                                                                            placeholder="Search vehicle"
                                                                            name="selectedVehicle"
                                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                            maxLength="10"
                                                                        />
                                                                        {showDropdownVehicle && (
                                                                            <ul ref={dropdownRef} className="mt-1 absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                                {Object.entries(vehicledata || {}).filter(([key, value]) =>
                                                                                    key.toLowerCase().includes(searchQueryVehicle.toLowerCase())
                                                                                ).map(([key, value]) => (
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
                                                                value={editData.SearchQueryVehicle}
                                                                onChange={handleEditChange}
                                                                placeholder="Enter vehicle manually"
                                                                name="SearchQueryVehicle"
                                                                className="block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                maxLength="10"
                                                            />

                                                        )}
                                                        {errorss.selectedVehicle && <span className="text-red-500 text-sm">{errorss.selectedVehicle}</span>}
                                                        {errorss.SearchQueryVehicle && <span className="text-red-500 text-sm">{errorss.SearchQueryVehicle}</span>}

                                                    </div>
                                                </div>

                                                {/* Fuel Type */}
                                                <div className="flex flex-col col-span-1 gap-1">

                                                    <label htmlFor="itemOrFuelType">{selectedCustomer === 'Cash' ? 'Item' : 'Fuel Type'}</label>
                                                    <div className="mt-1 relative">
                                                        <select
                                                            id="itemOrFuelType"
                                                            value={editData.selectedFuel}
                                                            onChange={(e) => handleSelectfuel(e.target.value)}
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        >
                                                            <option value="">Select {selectedCustomer === 'Cash' ? 'Item' : 'Fuel'}</option>
                                                            {selectedCustomer !== 'Cash' && (
                                                                <>
                                                                    {noozleData.map((item) => (

                                                                        <option key={item.NozzlesAssign.id} value={item.Nozzle.Item.name}>
                                                                            {item.Nozzle.Item.name}
                                                                        </option>

                                                                    ))

                                                                    }
                                                                </>)}
                                                            {ItemName.map((item) => (
                                                                <option key={item.Item.id} value={item.Item.name}>
                                                                    {item.Item.name}
                                                                </option>
                                                            ))
                                                            }
                                                        </select>
                                                        {/* {selectedCustomer} */}
                                                        {errors.selectedFuel && <span className="text-red-500 text-sm">{errors.selectedFuel}</span>}
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
                                                        maxLength="5"
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
                                                        maxLength="5"
                                                    />
                                                    {errorss.coupenNo && (
                                                        <span className="text-red-500 text-sm">{errorss.coupenNo}</span>
                                                    )}
                                                </div>

                                                {/* Quantity */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={editData.quantity}
                                                        name="quantity"
                                                        onChange={handleEditChange}
                                                        placeholder="Quantity"
                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                    {errorss.quantity && <span className="text-red-500 text-sm">{errorss.quantity}</span>}
                                                </div>
                                                {/* Rate */}
                                                <div className="flex flex-col col-span-1 gap-1">
                                                    <label htmlFor="rate">Rate</label>
                                                    <div className="mt-1 relative">
                                                        <input
                                                            type="number"
                                                            name="rate"
                                                            value={editData.rate || editData.mrp}
                                                            readOnly={selectedFuel === 'HSD' || selectedFuel === 'MS'}
                                                            disabled={selectedFuel === 'HSD' || selectedFuel === 'MS'}
                                                            onChange={handleEditChange}
                                                            placeholder="Rate"
                                                            className="block p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>



                                                {/* Total Amt */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="totalAmt" className="block text-sm font-medium text-gray-700">Total Amount</label>
                                                    <input
                                                        type="number"
                                                        value={editData.totalAmt}
                                                        name="totalAmt"
                                                        onChange={handleEditChange}
                                                        placeholder="Total Amount"
                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                    {errorss.totalAmt && <span className="text-red-500 text-sm">{errorss.totalAmt}</span>}
                                                </div>

                                                {/* Driver Cash */}
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor="driverCash" className="block text-sm font-medium text-gray-700">Driver Cash</label>
                                                    <input
                                                        type="number"
                                                        value={editData.driverCash}
                                                        name="driverCash"
                                                        onChange={handleEditChange}
                                                        placeholder="Driver Cash"
                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                                                    />
                                                    {errorss.driverCash && <span className="text-red-500 text-sm">{errorss.driverCash}</span>}
                                                </div>
                                                {(selectedFuel !== 'HSD' && selectedFuel !== 'MS') &&
                                                    <div className="flex flex-col col-span-1  gap-1">
                                                        <label htmlFor="sgst">SGST</label>
                                                        <input
                                                            type="number"
                                                            id="sgst"
                                                            value={editData.sgst}
                                                            readOnly
                                                            className="border p-2 border-gray-300 rounded"
                                                        // required
                                                        />
                                                        {errors.sgst && <span className="text-red-500 text-sm">{errors.sgst}</span>}
                                                    </div>

                                                }

                                                {(selectedFuel !== 'HSD' && selectedFuel !== 'MS') &&
                                                    <div className="flex flex-col col-span-1  gap-1">
                                                        <label htmlFor="cgst">CGST</label>
                                                        <input
                                                            type="number"
                                                            id="cgst"
                                                            value={editData.cgst}
                                                            readOnly
                                                            className="border p-2 border-gray-300 rounded"
                                                        // required
                                                        />
                                                        {errors.cgst && <span className="text-red-500 text-sm">{errors.cgst}</span>}
                                                    </div>

                                                }
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
                                                        disabled
                                                        className="border p-2 border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>

                                        </div>

                                        <div className="flex flex-row gap-5 mt-5">
                                            <Button color="primary" className="bg-gray-800 text-white" type="submit">Save</Button>
                                            <Button color="danger" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >

    );
}

export default CreditSale;
