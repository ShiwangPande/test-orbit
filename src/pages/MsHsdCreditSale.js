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
import { Spinner } from "@nextui-org/react";


import React from "react";

function MsHsdCreditSale({ petrodata }) {

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [ShiftData, setShiftData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryVehicle, setSearchQueryVehicle] = useState("");

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedFuel, setSelectedFuel] = useState('');

    const [msAndHsdSaleList, setmsAndHsdSaleList] = useState("")

    const [vehicledata, setVehicledata] = useState([])

    const [customerdata, setCustomerdata] = useState([])
    const [ledgerId, setLedgerId] = useState(null); // New state for ledger ID

    const [itemPriceList, setItemPriceList] = useState([]);

    const [showDropdown, setShowDropdown] = useState(false); // State to toggle the dropdown visibility
    const [showDropdownVehicle, setShowDropdownVehicle] = useState(false); // State to toggle the dropdown visibility
    const [showDropdownFuel, setShowDropdownFuel] = useState(false); // State to toggle the dropdown visibility
    const [rate, setRate] = useState(0);
    const [quantity, setQuantity] = useState('');
    const [selectedFuelId, setSelectedFuelId] = useState(null);

    const [gst, setgst] = useState('')
    const [totalAmt, setTotalAmt] = useState('');
    const [sgst, setSgst] = useState("");
    const [cgst, setCgst] = useState("");
    const [driverCash, setDriverCash] = useState('');
    const [inclusiveTotal, setInclusiveTotal] = useState('');
    const [submittedData, setSubmittedData] = useState([]);
    const [slipNo, setSlipNo] = useState('');
    const [coupenNo, setCoupenNo] = useState('');

    const [errors, setErrors] = useState({});

    const [dsmIds, setDsmIds] = useState([]);
    const [PriceID, setPriceID] = useState([]);
    const [petrolgst, setPetrolGst] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Function to open edit modal and populate with data
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    const base_url = process.env.REACT_APP_API_URL;
    // Function to handle changes in edit modal






    const dropdownRef = useRef(null);
    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('submittedData'));
        if (storedData) {
            setSubmittedData(storedData);
        }
    }, []);


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
            axios
                .post(`${base_url}/assignNozzleList/1`, {
                    shift: ShiftData.shift,
                    emp_id: petrodata.user_id,
                    date: ShiftData.date,
                    petro_id: petrodata.petro_id,
                    day_shift: petrodata.daily_shift,
                })
                .then((response) => {
                    if (response.status === 204) {
                        console.warn("No content returned from the server.");
                        // Handle this case as per your application's requirements
                    } else if (response.status === 200) {
                        if (response.data && response.data.data) {
                            const data = response.data.data;
                            const extractedDsmIds = data.map(item => item.NozzlesAssign.dsm_id);
                            setDsmIds(extractedDsmIds);
                            console.log('extractedDsmIds', extractedDsmIds);
                        } else {
                            console.error("Unexpected response data structure:", response.data);
                            // Handle unexpected response structure here
                        }
                    } else {
                        console.error("Unexpected response status:", response.status);
                        // Handle other unexpected response statuses here
                    }
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    // Handle specific error scenarios here
                });
        }
    }, [petrodata, ShiftData, base_url]);

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
        const fetchData = async () => {
            try {
                const response = await axios.post(`${base_url}/itemPriceList/1`, { petro_id: petrodata.petro_id });
                if (response.status === 200 && response.data && response.data.data) {
                    setItemPriceList(response.data.data);
                    const extractedId = response.data.data.map(item => item.Item.id);
                    setPriceID(extractedId);
                } else {
                    console.error("Unexpected response structure:", response.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (petrodata && base_url) {
            fetchData();
        }
    }, [petrodata, base_url]);


    useEffect(() => {
        console.log('itemPriceList:', itemPriceList); // Check the content of itemPriceList
        if (Array.isArray(itemPriceList) && itemPriceList.length > 0) {
            const hsdItem = itemPriceList.find(item => item.Item.name === 'HSD');
            if (hsdItem) {
                console.log('Found HSD item:', hsdItem); // Check if HSD item is found
                setSelectedFuel('HSD');
                setRate(hsdItem.Item.price);
                setSelectedFuelId(hsdItem.Item.id);
            }
        }
    }, [itemPriceList]);
    useEffect(() => {
        if (base_url && PriceID.length > 0) {
            axios.post(`${base_url}/getItemGstDetails/1`, { item_id: PriceID })
                .then(response => {
                    console.log('getItemGstDetails', response.data.data);
                    setPetrolGst([response.data.data]);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [base_url, PriceID]);

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

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (isSubmitting) return; // Prevent multiple submissions

        setIsSubmitting(true);

        const sale_type = selectedCustomer === 'CASH' ? 0 : 1;
        const customerid = selectedCustomer === 'CASH' ? 1 : ledgerId;

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        const payload = {
            is_card: 0,
            petro_id: petrodata.petro_id,
            shift: ShiftData.shift,
            dsm_id: dsmIds[0],
            vehicle_no: selectedVehicle || searchQueryVehicle,
            slip_no: slipNo,
            coupen_no: coupenNo,
            day_shift_no: ShiftData.day_shift_no,
            customer_id: customerid,
            date: ShiftData.date,
            state_id: petrodata.state_id,
            gst_type: 1,
            sale_type: sale_type,
            total_net_amt: inclusiveTotal,
            total_sgst_amt: sgst,
            total_cgst_amt: cgst,
            total_igst_amt: 0,
            total_dis_amt: 0,
            ms_hsd_sale: 1,
            cash_to_driver: driverCash,
            total_inclusive_amt: inclusiveTotal,
            total_gt_amt: totalAmt,
            addSaleItemList: [
                {
                    petro_id: petrodata.petro_id,
                    shift: ShiftData.shift,
                    batch_no: null,
                    qty: quantity,
                    rate: rate,
                    net_amt: totalAmt,
                    gst_rate: gst,
                    cgst_per: cgst,
                    sgst_per: sgst,
                    igst_per: 0,
                    cgst_amt: cgst,
                    sgst_amt: sgst,
                    igst_amt: 0,
                    dis: null,
                    dis_amt: 0,
                    total_amt: totalAmt,
                    inclusive_rate: rate,
                    inclusive_total: inclusiveTotal,
                    item_id: selectedFuelId
                }
            ]
        };

        try {
            await axios.post(`${base_url}/addSale/1`, payload);
            console.log('Data submitted successfully.');

            const [msHsdResponse] = await Promise.all([
                axios.post(`${base_url}/msAndHsdSaleListByShift/1`, {
                    shift: ShiftData.shift,
                    employee_id: petrodata.user_id,
                    date: ShiftData.date,
                    petro_id: petrodata.petro_id,
                    day_shift: petrodata.daily_shift,
                })
            ]);

            setmsAndHsdSaleList(msHsdResponse.data.data);

            resetForm();

            console.log('Form submitted successfully');
            onClose();

        } catch (error) {
            console.error('Error submitting data:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
        }

        setIsSubmitting(false);
    };

    const resetForm = () => {
        setSelectedVehicle('');
        setSelectedCustomer('');
        setQuantity('');
        setTotalAmt('');
        setDriverCash('');
        setInclusiveTotal('');
        setSlipNo('');
        setCoupenNo('');

        setShowDropdown(false);
        setSearchQuery('');
        setSearchQueryVehicle('');
        setCgst('');
        setSgst('');

    };

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
                    setmsAndHsdSaleList(response.data.data);
                    console.log('msAndHsdSaleListByShift', response.data.data)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, ShiftData, base_url]);






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
    }, [petrodata.petro_id, ledgerId, base_url]);


    const handleSelectCustomer = (customer) => {

        const selecteditemPriceList = itemPriceList.find(item => item.Item.name === selectedFuel);

        setLedgerId(customer.Ledger.id === 'CASH' ? 'CASH' : customer.Ledger.id);
        const defaultRate = selecteditemPriceList ? selecteditemPriceList.Item.price : "";
        setRate(defaultRate);

        setSelectedCustomer(customer.Ledger.name);

        setLedgerId(customer.Ledger.id);
        setSearchQuery(customer.Ledger.name);
        setSearchQueryVehicle("");
        setSelectedVehicle(null);
        setShowDropdown(false);

    };
    const handleClear = () => {

        setSelectedCustomer("");
        setLedgerId("");
        setSearchQuery("");
        setSearchQueryVehicle("");
        setSelectedVehicle(null);
        setShowDropdown(true);
    };






    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setShowDropdown(true);
        setSearchQuery(query);


    };
    const handleSearchVehicle = (event) => {
        const queryVehicle = event.target.value.toLowerCase();
        setSearchQueryVehicle(queryVehicle);
        setShowDropdownVehicle(true);
    };

    const handleSelectVehicle = (vehicleNumber) => {
        setSelectedVehicle(vehicleNumber);

        setShowDropdownVehicle(false);
        setSearchQueryVehicle(vehicleNumber);
    };



    const handleSelectfuel = (selectedValue) => {
        console.log('Selected Value:', selectedValue);
        const allItems = [...itemPriceList];
        const selectedItem = allItems.find(item => item.Item.name === selectedValue);

        if (selectedItem) {
            const { id, price } = selectedItem.Item;
            setSelectedFuel(selectedValue);
            setRate(price);
            setSelectedFuelId(id);
            calculateTotalAmt(quantity, price);
        }

        setShowDropdownFuel(false);
    };



    useEffect(() => {
        const total = parseFloat(totalAmt) || 0;


        const petrolGstItem = petrolgst.find(item => item.GstMaster && item.GstMaster.gst_percentage !== null);
        const gst_petrol_percentage = parseFloat(petrolGstItem?.GstMaster?.gst_percentage) || 0;



        const baseAmount = (total * gst_petrol_percentage) / (100 + gst_petrol_percentage);
        const calculatedCgst = baseAmount / 2;
        const calculatedSgst = baseAmount / 2;

        setCgst(calculatedCgst.toFixed(2));
        setSgst(calculatedSgst.toFixed(2));
        setgst(gst_petrol_percentage);
        setInclusiveTotal(total.toFixed(2));

    }, [totalAmt, selectedFuel, petrolgst, itemPriceList]);







    const calculateTotalAmt = (quantity, rate) => {
        const effectiveRate = parseFloat(rate) || 0;
        let effectiveQuantity = parseFloat(quantity) || 0;

        if (effectiveQuantity > 20000) {
            effectiveQuantity = 20000;
        }

        const total = effectiveQuantity * effectiveRate;
        const gstAmount = (total * (gst / 100)) / (1 + gst / 100);
        const inclusiveTotal = total - gstAmount;

        setTotalAmt(total.toFixed(2));
        setInclusiveTotal(inclusiveTotal.toFixed(2));
    };

    const handleQuantityChange = (e) => {
        let quantityValue = e.target.value;

        // Ensure the input value does not have more than two decimal places
        const regex = /^\d*\.?\d{0,2}$/;
        if (!regex.test(quantityValue)) {
            return;
        }

        quantityValue = parseFloat(quantityValue);

        if (isNaN(quantityValue)) {
            quantityValue = '';
        } else if (quantityValue > 20000) {
            quantityValue = 20000;
            setErrors((prev) => ({ ...prev, quantity: 'Quantity cannot exceed 20,000' }));
        } else {
            setErrors((prev) => ({ ...prev, quantity: '' }));
        }

        setQuantity(quantityValue);
        calculateTotalAmt(quantityValue, rate);
    };


    // Handle change in total amount
    const handleTotalAmtChange = (e) => {
        let totalAmtValue = e.target.value;

        // Ensure the input value does not have more than two decimal places
        const regex = /^\d*\.?\d{0,2}$/;
        if (!regex.test(totalAmtValue)) {
            return;
        }

        totalAmtValue = parseFloat(totalAmtValue);
        const effectiveRate = parseFloat(rate);
        const potentialQuantity = totalAmtValue / effectiveRate;

        if (potentialQuantity > 20000) {
            totalAmtValue = parseFloat((20000 * effectiveRate).toFixed(2));
            setErrors((prev) => ({ ...prev, totalAmt: 'Total amount results in quantity exceeding 20,000' }));
        } else {
            setErrors((prev) => ({ ...prev, totalAmt: '' }));
        }

        setTotalAmt(totalAmtValue.toFixed(2));
        calculateQuantity(totalAmtValue, effectiveRate);
    };


    // Calculation function to calculate quantity based on total amount and rate
    const calculateQuantity = (total, rate) => {
        const effectiveRate = rate;
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
    }, [submittedData.length]);

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

        <div className="h-full  min-h-screen flex   bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 ">

            <Navbar petrodata={petrodata} />

            <main className="flex-1 overflow-x-hidden focus:outline-none">
                <div className=' relative z-0 overflow-x-hidden overflow-y-auto'>
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
                                        Add MS HSD Credit/Cash Sale
                                    </ModalHeader>
                                    <form onSubmit={handleSubmit}>
                                        <ModalBody className="px-4 lg:px-8">

                                            <>
                                                <div className="mb-4 flex justify-between">
                                                    <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">
                                                        Date: <span className='text-red-500 font-medium'>        {ShiftData.date}</span>
                                                    </h2>
                                                    <h2 className="block text-gray-700 text-lg font-bold mb-0 lg:mb-2">  Shift: <span className='text-red-500 font-medium'>  {ShiftData.day_shift_no}</span></h2>
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
                                                        <input autoComplete="off"
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
                                                                <li key="cash-option" className="py-2 px-3 capitalize cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer({ Ledger: { id: 'CASH', name: 'CASH' } })}>
                                                                    CASH
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
                                                                    <input autoComplete="off"
                                                                        type="text"
                                                                        value={searchQueryVehicle}
                                                                        onChange={(e) => setSearchQueryVehicle(e.target.value)}
                                                                        placeholder="Enter vehicle manually"
                                                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                        maxLength="10"
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <input autoComplete="off"
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
                                                            <input autoComplete="off"
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
                                                    <label htmlFor="itemOrFuelType">
                                                        {selectedCustomer === 'CASH' ? 'Item' : 'Fuel Type'}
                                                    </label>
                                                    <div className="mt-1 relative">
                                                        <select
                                                            id="itemOrFuelType"
                                                            value={selectedFuel}
                                                            onChange={(e) => handleSelectfuel(e.target.value)}
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        >
                                                            <option value="">
                                                                Select {selectedCustomer === 'CASH' ? 'Item' : 'Fuel'}
                                                            </option>
                                                            {[...itemPriceList].map((item) => (
                                                                <option key={item.Item.id} value={item.Item.name}>
                                                                    {item.Item.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors.selectedFuel && <span className="text-red-500 text-sm">{errors.selectedFuel}</span>}
                                                    </div>
                                                </div>





                                                {/* Slip No */}
                                                <div className="flex flex-col col-span-1  gap-1">
                                                    <label htmlFor="slip">Slip No</label>
                                                    <input autoComplete="off"
                                                        type="text"
                                                        value={slipNo}
                                                        onChange={(e) => setSlipNo(e.target.value)}
                                                        id="slip"
                                                        placeholder="Slip No"
                                                        className="border p-2 border-gray-300 rounded"
                                                        maxLength={5}
                                                    />

                                                </div>
                                                {/* Coupen No */}
                                                <div className="flex flex-col col-span-1  gap-1">
                                                    <label htmlFor="coupen">Coupen No</label>
                                                    <input autoComplete="off"
                                                        type="text"
                                                        value={coupenNo}
                                                        onChange={(e) => setCoupenNo(e.target.value)}
                                                        id="coupen"
                                                        placeholder="Coupen No"
                                                        className="border p-2 border-gray-300 rounded"
                                                        maxLength={5}
                                                    />
                                                </div>
                                                {/* rate */}
                                                <div className="flex flex-col col-span-1 gap-1">
                                                    <label htmlFor="rate">Rate</label>
                                                    <div className="mt-1 relative">
                                                        <input autoComplete="off"
                                                            type="number"
                                                            value={rate}

                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (!isNaN(value) && value.length <= 7) {
                                                                    const rate = parseFloat(value);
                                                                    setRate(rate);
                                                                    calculateTotalAmt(quantity, rate);
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
                                                    <input autoComplete="off"
                                                        type="number"
                                                        id="Quantity"
                                                        value={quantity}
                                                        onChange={handleQuantityChange}
                                                        placeholder="Quantity"
                                                        disabled={!selectedFuel}
                                                        className="border p-2 border-gray-300 rounded"
                                                    // required
                                                    />
                                                    {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity}</span>}
                                                </div>


                                                {/* Total Amt */}
                                                <div className="flex flex-col col-span-1 gap-1">
                                                    <label htmlFor="Coupen">Total Amount</label>
                                                    <input autoComplete="off"
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
                                                    <input autoComplete="off"
                                                        type="number"
                                                        value={driverCash}
                                                        onChange={handleDriverCashChange}
                                                        id="DRIVER CASH"
                                                        placeholder="Driver Cash"
                                                        className="border p-2 border-gray-300 rounded"


                                                    />
                                                    {errors.driverCash && <span className="text-red-500 text-sm">{errors.driverCash}</span>}

                                                </div>

                                                {/* Driver Cash */}

                                                {/* Inclusive Total */}
                                                <div className="flex flex-col col-span-2 lg:col-span-1 gap-1">
                                                    <label htmlFor="Coupen">Inclusive Total</label>
                                                    <input autoComplete="off"
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

                    <div className='w-[90vw] lg:w-[80.5vw] bg-navbar lg:fixed relative lg:mt-5 mt-16 mx-5  rounded-md px-8 py-5 '><div className="  flex justify-between">


                        <h2 className="block    text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">
                            Date: <span className='text-red-500 font-medium'>        {ShiftData.formattedDate}</span>
                        </h2>
                        <h2 className="block   text-white text-md lg:text-lg font-bold mb-0 lg:mb-2">  Shift: <span className='text-red-500 font-medium'>  {ShiftData.day_shift_no}</span></h2>
                    </div>
                    </div>




                    <div className=" mt-5 mx-5 grid grid-cols-1 lg:mt-28 lg:grid-cols-3 gap-3 lg:gap-5">
                        {Array.isArray(msAndHsdSaleList) && msAndHsdSaleList.length > 0 ? (
                            msAndHsdSaleList.map((voucher, index) => (
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
                                        onClick={() => handleCardClick(index)}
                                    >
                                        <h5 className="lg:mb-1 mb-1 text-lg lg:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                            {voucher.Ledger?.name}
                                        </h5>

                                        {voucher.Sale.vehicle_no && <div className="text-gray-700 font-semibold">
                                            Vehicle No: <span className="font-bold">{voucher.Sale.vehicle_no}</span>
                                        </div>}
                                        {voucher.SalesDetail && voucher.SalesDetail.length > 0 && voucher.SalesDetail.map((detail, detailIndex) => (
                                            <div key={detailIndex} className="lg:my-2 my-1 grid grid-cols-2 lg:grid-cols-2 lg:gap-2 gap-1 lg:text-base text-xs">
                                                {voucher.Sale.slip_no && <div className="text-gray-700 font-semibold">
                                                    Slip No: <span className="font-bold">{voucher.Sale.slip_no}</span>
                                                </div>}
                                                {voucher.Sale.coupen_no && <div className="text-gray-700 font-semibold">
                                                    Coupen No: <span className="font-bold">{voucher.Sale.coupen_no}</span>
                                                </div>}
                                                {detail.Item?.name && <p className="text-gray-700 font-semibold">
                                                    Item: <span className="font-bold">{detail.Item?.name}</span>
                                                </p>}
                                                {detail.inclusive_rate && <p className="text-gray-700 font-semibold">
                                                    Rate: <span className="font-bold">{detail.inclusive_rate}</span>
                                                </p>}
                                                {detail.quantity && <p className="text-gray-700 font-semibold">
                                                    Quantity: <span className="font-bold">{detail.quantity}</span>
                                                </p>}
                                                {detail.total_amount && <p className="text-gray-700 font-semibold">
                                                    Total Amount: <span className="font-bold">{detail.total_amount}</span>
                                                </p>}
                                                {detail.inclusive_total && <p className="text-gray-700 col-span-2 font-semibold">
                                                    Inclusive Total: <span className="font-bold">{detail.inclusive_total}</span>
                                                </p>}

                                            </div>
                                        ))}


                                        {!isMobile && (
                                            <div className="flex flex-row justify-around mt-2">
                                                <button
                                                    className="px-2 w-10 h-10"
                                                    onClick={() => handleRemove(index)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                        <path d="M5.755 20.283 4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z" fill="#F44336" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                    {isMobile && (
                                        <>
                                            {swipeStates[index] && swipeStates[index].isHeld && (
                                                <>
                                                    <button className="h-full flex flex-row rounded-lg bg-redish justify-around" onClick={() => handleRemove(index)}>
                                                        <div className="px-2 w-10 h-10 my-auto" color="primary">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                                <path d="M5.755 20.283L4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z" fill="#fff" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No card sales available.</p>
                        )}



                    </div>
                </div>
            </main >
        </div >

    );
}

export default MsHsdCreditSale;
