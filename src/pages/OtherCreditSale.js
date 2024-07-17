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

import { PuffLoader } from "react-spinners";

import React from "react";

function OtherCreditSale({ petrodata }) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [ShiftData, setShiftData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryVehicle, setSearchQueryVehicle] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedFuel, setSelectedFuel] = useState('');


    const [getOtherSaleList, setgetOtherSaleList] = useState("")
    const [vehicledata, setVehicledata] = useState([])
    const [ItemName, setItemName] = useState([])
    const [customerdata, setCustomerdata] = useState([])
    const [ledgerId, setLedgerId] = useState(null); // New state for ledger ID



    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdownVehicle, setShowDropdownVehicle] = useState(false);
    const [showDropdownFuel, setShowDropdownFuel] = useState(false);
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
    const [igst, setIgst] = useState('')
    const [gstType, setGstType] = useState("cgst_sgst"); // New state to track GST type
    const [shouldFetchAdd, setShouldFetchAdd] = useState(false);
    const [loading, setLoading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    const base_url = process.env.REACT_APP_API_URL;


    const dropdownRef = useRef(null);



    useEffect(() => {
        if (petrodata && petrodata && base_url) {
            axios
                .post(`${base_url}/currentShiftData/1`,
                    {
                        "petro_id": petrodata.petro_id,
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
        if (petrodata && base_url) {
            setLoading(true); // Start loading

            console.log("Fetching current shift data...");
            axios.post(`${base_url}/currentShiftData/1`, {
                "petro_id": petrodata.petro_id,
            })
                .then((response) => {
                    console.log("Current shift data response:", response);
                    const { shift, day_shift_no, date } = response.data.data.DailyShift;
                    const formattedDate = formatDate(date);
                    const newShiftData = { shift, day_shift_no, formattedDate, date };
                    setShiftData(newShiftData);

                    // Now perform the second API call
                    return axios.post(`${base_url}/assignNozzleList/1`, {
                        "shift": shift,
                        "emp_id": petrodata.user_id,
                        "date": date,
                        "petro_id": petrodata.petro_id,
                        "day_shift": petrodata.daily_shift,
                    });
                })
                .then((response) => {
                    console.log("Assign nozzle list response:", response);

                    if (response.status === 200 && response.data.status === 200) {
                        let noozleassigned = true;
                        if (response.data.data) {
                            const data = response.data.data;
                            const extractedDsmIds = data.map(item => item.NozzlesAssign.dsm_id);
                            setDsmIds(extractedDsmIds);
                            console.log('extractedDsmIds', extractedDsmIds);
                        } else {
                            console.error("Unexpected response data structure:", response.data);
                        }
                        setShouldFetchAdd(noozleassigned);
                    } else {
                        console.log("No content returned from the API or unexpected status:", response.data);
                        setShouldFetchAdd(false);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    setShouldFetchAdd(false);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        }
    }, [petrodata, base_url]);

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
        if (petrodata && base_url) {
            axios.post(`${base_url}/searchItemByName/1`, { "petro_id": petrodata.petro_id })
                .then(response => {
                    const data = response.data.data;
                    console.log("setItemName", data);
                    setItemName(data);
                    const extractedId = data.map(item => item.Item.id);
                    setPriceID(extractedId);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [petrodata, base_url]);





    useEffect(() => {
        console.log('itemPItemNamericeList:', ItemName); // Check the content of ItemName
        if (Array.isArray(ItemName) && ItemName.length > 0) {
            const SERVOItem = ItemName.find(item => item.Item.name === 'SERVO 4T - 1 LTR');
            if (SERVOItem) {
                console.log('Found SERVO item:', SERVOItem); // Check if HSD item is found
                setSelectedFuel('SERVO 4T - 1 LTR');
                setRate(SERVOItem.Item.mrp);
                setSelectedFuelId(SERVOItem.Item.id);
            }
        }
    }, [ItemName]);

    useEffect(() => {
        if (base_url && PriceID.length > 0) {
            axios.post(`${base_url}/getItemGstDetails/1`, { "item_id": PriceID })
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
        if (!selectedFuel) {
            newErrors.selectedFuel = 'Oil Type is required';
        }
        if (quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0';
        }
        if (rate <= 0) {
            newErrors.rate = 'Rate must be greater than 0';
        }
        if (!rate) {
            newErrors.rate = 'Rate is required';
        }
        if (!quantity) {
            newErrors.quantity = 'Quantity is required';
        }

        const vehicleToUse = selectedVehicle || searchQueryVehicle.trim();
        const parsedDriverCash = parseFloat(driverCash);

        if (parsedDriverCash < 0) {
            newErrors.driverCash = 'Driver Cash cannot be negative';
        } else if (parsedDriverCash > 10000000) {
            newErrors.driverCash = 'Driver Cash cannot exceed 10,000,000';
        } else if (parsedDriverCash >= 0 && !vehicleToUse) {
            newErrors.driverCash = 'If driver cash is greater than 0, a vehicle must be selected or entered manually';
        }
        setErrors(newErrors);



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        const sale_type = selectedCustomer === 'CASH' ? 0 : 1;
        const customerid = selectedCustomer === 'CASH' ? 1 : ledgerId;
        const gsttype = gstType === 'igst' ? 1 : 0;
        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        const payload = {
            is_card: 0,
            petro_id: petrodata.petro_id,
            shift: `${ShiftData.shift}`,
            dsm_id: dsmIds[0],
            vehicle_no: selectedVehicle || searchQueryVehicle,
            slip_no: slipNo,
            coupen_no: coupenNo,
            day_shift_no: ShiftData.day_shift_no,
            customer_id: customerid,
            date: ShiftData.date,
            state_id: petrodata.state_id,
            gst_type: gsttype,
            sale_type: sale_type,
            total_net_amt: inclusiveTotal,
            total_sgst_amt: sgst,
            total_cgst_amt: cgst,
            total_igst_amt: igst,
            total_dis_amt: 0,
            ms_hsd_sale: 0,
            cash_to_driver: driverCash,
            total_inclusive_amt: inclusiveTotal,
            total_gt_amt: totalAmt,
            addSaleItemList: [
                {
                    petro_id: petrodata.petro_id,
                    shift: `${ShiftData.shift}`,
                    batch_no: null,
                    qty: quantity,
                    rate: rate,
                    net_amt: totalAmt,
                    gst_rate: gst,
                    cgst_per: cgst,
                    sgst_per: sgst,
                    igst_per: igst,
                    cgst_amt: cgst,
                    sgst_amt: sgst,
                    igst_amt: igst,
                    dis: null,
                    dis_amt: 0,
                    total_amt: totalAmt,
                    inclusive_rate: rate,
                    inclusive_total: inclusiveTotal,
                    item_id: selectedFuelId
                }
            ]
        };
        if (petrodata && ShiftData && base_url) {
            setLoading(true); // Start loading
            try {
                await axios.post(`${base_url}/addSale/1`, payload);
                console.log('Data submitted successfully.');

                const [otherResponse] = await Promise.all([
                    axios.post(`${base_url}/getOtherSaleListByShiftOrType/1`, {
                        shift: `${ShiftData.shift}`,
                        employee_id: petrodata.user_id,
                        date: ShiftData.date,
                        petro_id: petrodata.petro_id,
                        day_shift: petrodata.daily_shift,
                    })

                ]);


                setgetOtherSaleList(otherResponse.data.data);

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
            } finally {
                setLoading(false); // Stop loading
            };
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
            setLoading(true); // Start loading

            axios.post(`${base_url}/getOtherSaleListByShiftOrType/1`, {
                "shift": `${ShiftData.shift}`,
                "employee_id": petrodata.user_id,
                "date": ShiftData.date,
                "petro_id": petrodata.petro_id,
                "day_shift": petrodata.daily_shift,
            })
                .then(response => {
                    setgetOtherSaleList(response.data.data);
                    console.log('getOtherSaleListByShiftOrType', response.data.data)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        }
    }, [petrodata, ShiftData, base_url]);





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
        // const selectedItem = ItemName.find(item => item.Item.name === selectedFuel);
        setLedgerId(customer.Ledger.id === 'CASH' ? 'CASH' : customer.Ledger.id);
        // const defaultRate = selectedItem ? selectedItem.Item.mrp : '';
        // setRate(defaultRate);

        if (customer.Ledger.id === 'CASH') {
            setGstType('cgst_sgst');
        } else {
            const gstIN = String(customer.PartyDetail?.gstin).substring(0, 2);
            if (gstIN === "27") {
                setGstType('cgst_sgst');
            } else {
                setGstType('igst');
            }
        }

        setSelectedCustomer(customer.Ledger.name);
        setSearchQuery(customer.Ledger.name);
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
        setShowDropdownVehicle(false);
        setSearchQueryVehicle(vehicleNumber);
    };

    const handleSelectfuel = (selectedValue) => {
        console.log('Selected Value:', selectedValue);
        const allItems = [...ItemName];
        const selectedItem = allItems.find(item => item.Item.name === selectedValue);

        if (selectedItem) {
            const { id, mrp } = selectedItem.Item;
            setSelectedFuel(selectedValue);
            setRate(mrp);
            setSelectedFuelId(id);
            calculateTotalAmt(quantity, mrp, mrp);
        }

        setShowDropdownFuel(false);
    };



    useEffect(() => {
        const total = parseFloat(totalAmt) || 0;

        const petrolGstItem = petrolgst.find(item => item.GstMaster && item.GstMaster.gst_percentage !== null);
        const gst_petrol_percentage = parseFloat(petrolGstItem?.GstMaster?.gst_percentage) || 0;
        const igst_petrol_percentage = parseFloat(petrolGstItem?.GstMaster?.igst) || 0;

        const selectedCustomerData = customerdata.find(item => item.Ledger.name === selectedCustomer);
        const gstIN = selectedCustomerData ? String(selectedCustomerData.PartyDetail?.gstin).substring(0, 2) : '';

        if (selectedCustomer === 'CASH' || gstIN === "27") {
            const baseAmount = (total * gst_petrol_percentage) / (100 + gst_petrol_percentage);
            const calculatedCgst = (baseAmount / 2).toFixed(2);
            const calculatedSgst = (baseAmount / 2).toFixed(2);

            setCgst(calculatedCgst);
            setSgst(calculatedSgst);
            setgst(gst_petrol_percentage);
            setGstType('cgst_sgst');

            const inclusiveTotal = total - (parseFloat(calculatedCgst) + parseFloat(calculatedSgst));
            setInclusiveTotal(inclusiveTotal.toFixed(2));
        } else {
            const baseIGSTAmount = (total * igst_petrol_percentage) / (100 + igst_petrol_percentage);
            const calculatedIgst = baseIGSTAmount.toFixed(2);
            setCgst(0);
            setSgst(0);
            setgst(gst_petrol_percentage);
            setIgst(calculatedIgst);
            setGstType('igst');

            const inclusive_IGST = total - parseFloat(calculatedIgst);
            setInclusiveTotal(inclusive_IGST.toFixed(2));
        }
    }, [totalAmt, selectedCustomer, petrolgst, customerdata]);










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
        const effectiveRate = parseFloat(rate);
        const potentialQuantity = parseFloat(totalAmtValue) / effectiveRate;

        if (potentialQuantity > 20000) {
            totalAmtValue = (20000 * effectiveRate).toFixed(2);
            setErrors((prev) => ({ ...prev, totalAmt: 'Total amount results in quantity exceeding 20,000' }));
        } else {
            setErrors((prev) => ({ ...prev, totalAmt: '' }));
        }

        setTotalAmt(totalAmtValue);
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
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PuffLoader size={150} color={"#000000"} loading={loading} />
            </div>
        );
    }

    return (

        <div className="h-full  min-h-screen flex   bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 ">

            <Navbar petrodata={petrodata} />

            <main className="flex-1 overflow-x-hidden focus:outline-none">
                <div className=' relative z-0 overflow-x-hidden overflow-y-auto'>
                    {shouldFetchAdd && (
                        <div className="flex flex-wrap gap-3">
                            <Button className="bg-navbar fixed z-50 w-16 max-w-none min-w-16 h-16 border-2 p-0 border-white right-0   bottom-0 m-5 rounded-full hover:invert text-white" onPress={onOpen}>
                                <img src={add} className="w-8 h-8" alt="" />
                            </Button>
                        </div>
                    )
                    }
                    <Modal isOpen={isOpen} size="5xl" scrollBehavior="outside" isDismissable={false} isKeyboardDismissDisabled={true} placement="top"
                        onOpenChange={onOpenChange}>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col text-2xl bg-navbar text-white gap-1">
                                        Add Other Credit/Cash Sale
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
                                                            onClick={() => setShowDropdown(true)}
                                                            placeholder="Search customers"
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                        {selectedCustomer && (
                                                            <button
                                                                onClick={handleClear}
                                                                className="absolute top-1 w-8 h-8 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1"
                                                            >
                                                                &#x2715;
                                                            </button>
                                                        )}
                                                        {showDropdown && (
                                                            <ul ref={dropdownRef} className="mt-1 absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md overflow-y-auto max-h-60">
                                                                <li key="cash-option" className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer({ Ledger: { id: 'CASH', name: 'CASH' } })}>
                                                                    CASH
                                                                </li>
                                                                {customerdata.length === 0 ? (
                                                                    <li className="py-2 px-3 text-gray-500">No data available</li>
                                                                ) : (
                                                                    customerdata
                                                                        .filter(item => item.Ledger.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                                        .map((item) => (
                                                                            <li key={item.Ledger.id} className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectCustomer(item)}>
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


                                                <div className="flex flex-col col-span-1 gap-1">
                                                    <label htmlFor="itemOrFuelType">
                                                        {selectedCustomer === 'CASH' ? 'Item' : 'Oil Type'}
                                                    </label>
                                                    <div className="mt-1 relative">
                                                        <select
                                                            id="itemOrFuelType"
                                                            value={selectedFuel}
                                                            onChange={(e) => handleSelectfuel(e.target.value)}
                                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        >
                                                            <option value="">
                                                                Select {selectedCustomer === 'CASH' ? 'Item' : 'Oil'}
                                                            </option>
                                                            {[...ItemName].map((item) => (
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
                                                        {errors.rate && <span className="text-red-500 text-sm">{errors.rate}</span>}

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
                                                {selectedCustomer !== "CASH" && (
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
                                                )}

                                                {gstType === 'cgst_sgst' ? (
                                                    <>
                                                        <div className="flex flex-col col-span-1 gap-1">
                                                            <label htmlFor="sgst">SGST</label>
                                                            <input autoComplete="off"
                                                                type="number"
                                                                id="sgst"
                                                                value={sgst}
                                                                readOnly
                                                                className="border p-2 border-gray-300 rounded"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col col-span-1 gap-1">
                                                            <label htmlFor="cgst">CGST</label>
                                                            <input autoComplete="off"
                                                                type="number"
                                                                id="cgst"
                                                                value={cgst}
                                                                readOnly
                                                                className="border p-2 border-gray-300 rounded"
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-col col-span-1 gap-1">
                                                            <label htmlFor="igst">IGST</label>
                                                            <input autoComplete="off"
                                                                type="number"
                                                                id="igst"
                                                                value={igst}
                                                                readOnly
                                                                className="border p-2 border-gray-300 rounded"
                                                            />
                                                        </div>
                                                    </>
                                                )}



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



                    {shouldFetchAdd === true ? (
                        <div className=" mt-5 mx-5 grid grid-cols-1 lg:mt-28 lg:grid-cols-3 gap-3 lg:gap-5">
                            {Array.isArray(getOtherSaleList) && getOtherSaleList.length > 0 ? (
                                getOtherSaleList.map((voucher, index) => (
                                    <div key={index} ref={containerRef} className="relative -z-0  justify-center flex flex-row overflow-hidden">
                                        {/* {isMobile && (
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
                                    )} */}
                                        <div
                                            className="flex select-none flex-col w-full justify-between lg:max-w-3xl max-w-sm lg:p-4 p-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                                        // initial={{ x: 0 }}
                                        // animate={{ x: (swipeStates[index]?.isSwipedRight ? 10 : 0) }}
                                        // drag={isMobile ? "x" : false}
                                        // dragConstraints={dragConstraints}
                                        // onDragEnd={(event, info) => handleDragEnd(index, event, info)}
                                        // onClick={() => handleCardClick(index)} 
                                        >
                                            <div>
                                                <h5 className="lg:mb-1 mb-1 text-lg lg:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                    {voucher.Ledger?.name}
                                                </h5>
                                                {voucher.Sale.vehicle_no && <div className="text-redish lg:text-lg text-sm font-semibold">
                                                    <span className="font-bold">{voucher.Sale.vehicle_no}</span>
                                                </div>}
                                            </div>

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
                                            {/* {!isMobile && (
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
                                        )} */}
                                        </div>
                                        {/* {isMobile && (
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
                                    )} */}
                                    </div>
                                ))
                            ) : (
                                <div className="flex h-[70vh] lg:h-[80vh] col-span-4  justify-center items-center w-full  px-4 sm:px-6 lg:px-8">
                                    <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10 border border-gray-300 max-w-md sm:max-w-lg lg:max-w-2xl">
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-red-500 mb-4 text-center">No card sales added.</h1>
                                    </div>
                                </div>


                            )}

                        </div>
                    ) : (
                        <div className="flex h-[79vh] lg:h-screen justify-center items-center w-full  px-4 sm:px-6 lg:px-8">
                            <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10 border border-gray-300 max-w-md sm:max-w-lg lg:max-w-2xl">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl text-red-500 mb-4 text-center">Nozzle is not Assigned.</h1>
                                <p className="text-gray-700 text-center sm:text-lg">Please contact your administrator or try again later.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >

    );
}

export default OtherCreditSale;
