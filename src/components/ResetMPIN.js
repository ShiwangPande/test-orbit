import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import navlogo from "../images/loginlogo.svg";
import axios from 'axios';

const schema = yup.object().shape({
    oldMpin: yup.string().required('Old MPIN is required').matches(/^[0-9]{4}$/, 'Old MPIN must be 4 digits'),
    newMpin: yup.string().required('New MPIN is required').matches(/^[0-9]{4}$/, 'New MPIN must be 4 digits'),
    confirmMpin: yup.string().oneOf([yup.ref('newMpin'), null], 'MPINs must match')
});

function ResetMPIN({ petrodata, financialYear }) {
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const [resetError, setResetError] = useState('');
    const [oldMpin, setOldMpin] = useState(['', '', '', '']);
    const [newMpin, setNewMpin] = useState(['', '', '', '']);
    const [confirmMpin, setConfirmMpin] = useState(['', '', '', '']);
    const base_url = process.env.REACT_APP_API_URL;

    const oldMpinRefs = useRef([]);
    const newMpinRefs = useRef([]);
    const confirmMpinRefs = useRef([]);

    const handlePinChange = (value, index, pinType) => {
        const newPin = pinType === 'oldMpin' ? [...oldMpin] :
            pinType === 'newMpin' ? [...newMpin] :
                [...confirmMpin];

        newPin[index] = value;

        if (pinType === 'oldMpin') {
            setOldMpin(newPin);
            setValue('oldMpin', newPin.join(''), { shouldValidate: true });
            handleFocusChange(oldMpinRefs, value, index);
        } else if (pinType === 'newMpin') {
            setNewMpin(newPin);
            setValue('newMpin', newPin.join(''), { shouldValidate: true });
            handleFocusChange(newMpinRefs, value, index);
        } else {
            setConfirmMpin(newPin);
            setValue('confirmMpin', newPin.join(''), { shouldValidate: true });
            handleFocusChange(confirmMpinRefs, value, index);
        }
    };

    const handleFocusChange = (refs, value, index) => {
        if (value === '' && index > 0) {
            refs.current[index - 1].focus();
        } else if (value !== '' && index < 3) {
            refs.current[index + 1]?.focus();
        }
    };

    const onSubmit = async (formData) => {
        const { oldMpin, newMpin } = formData;

        try {
            const response = await axios.post(
                `${base_url}/mpinRegenration/${financialYear}`,
                {
                    "user_id": petrodata.user_id,
                    "old_mpin": oldMpin,
                    "new_mpin": newMpin
                }
            );

            if (response.data.status === 200 && response.data.msg === "UPDATED") {
                navigate('/mpin-login', { state: { mobile: petrodata.mobile } });
            } else {
                setResetError('Failed to reset MPIN. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting MPIN:', error);
            setResetError('An error occurred. Please try again.');
        }
    };

    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>
            <div className='mx-auto flex justify-center items-center h-[90vh]'>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-8 rounded-lg shadow-md">
                    <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="" />

                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="oldMpin" className="block mb-1 text-black">Old MPIN</label>
                        <div className="flex justify-center">
                            {oldMpin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (oldMpinRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    pattern="\d{1}"
                                    min={1}
                                    max={9}
                                    onChange={(e) => handlePinChange(e.target.value, index, 'oldMpin')}
                                    className={`w-12 h-12 mx-1 text-center text-2xl border ${errors.oldMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                                />
                            ))}
                        </div>
                        {errors.oldMpin && <p className="text-red-500 text-sm mt-1">{errors.oldMpin.message}</p>}
                    </div>

                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="newMpin" className="block mb-1 text-black">New MPIN</label>
                        <div className="flex justify-center">
                            {newMpin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (newMpinRefs.current[index] = el)}
                                    type="text"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(e.target.value, index, 'newMpin')}
                                    className={`w-12 h-12 mx-1 text-center text-2xl border ${errors.newMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                                />
                            ))}
                        </div>
                        {errors.newMpin && <p className="text-red-500 text-sm mt-1">{errors.newMpin.message}</p>}
                    </div>

                    <div className="mb-6 lg:mb-8">
                        <label htmlFor="confirmMpin" className="block mb-1 text-black">Confirm MPIN</label>
                        <div className="flex justify-center">
                            {confirmMpin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (confirmMpinRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(e.target.value, index, 'confirmMpin')}
                                    className={`w-12 h-12 mx-1 text-center text-2xl border ${errors.confirmMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                                />
                            ))}
                        </div>
                        {errors.confirmMpin && <p className="text-red-500 text-sm mt-1">{errors.confirmMpin.message}</p>}
                    </div>

                    {resetError && <p className="text-red-500 text-sm mb-4">{resetError}</p>}

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none"
                    >
                        Reset MPIN
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetMPIN;
