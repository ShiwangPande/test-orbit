import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import navlogo from "../images/loginlogo.svg";
import axios from 'axios';

const mpinSchema = yup.object().shape({
    mpin: yup.string().required('MPIN is required').matches(/^[0-9]{4}$/, 'MPIN must be 4 digits'),
    confirmMpin: yup.string().oneOf([yup.ref('mpin'), null], 'MPINs must match')
});

function SetupMPIN({ petrodata }) {
    const mobile = JSON.parse(localStorage.getItem('userMobile')) || '';
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(mpinSchema),
    });

    const [setupError, setSetupError] = useState('');
    const [mpin, setMpin] = useState(['', '', '', '']);
    const [confirmMpin, setConfirmMpin] = useState(['', '', '', '']);
    const base_url = process.env.REACT_APP_API_URL;

    const mpinRefs = useRef([]);
    const confirmMpinRefs = useRef([]);

    const handlePinChange = (value, index, pinType) => {
        const newPin = pinType === 'mpin' ? [...mpin] : [...confirmMpin];
        newPin[index] = value;

        if (pinType === 'mpin') {
            setMpin(newPin);
            setValue('mpin', newPin.join(''), { shouldValidate: true });
        } else {
            setConfirmMpin(newPin);
            setValue('confirmMpin', newPin.join(''), { shouldValidate: true });
        }

        if (value === '' && index > 0) {
            pinType === 'mpin' ? mpinRefs.current[index - 1].focus() : confirmMpinRefs.current[index - 1].focus();
        } else if (value !== '' && index < 3) {
            pinType === 'mpin' ? mpinRefs.current[index + 1].focus() : confirmMpinRefs.current[index + 1].focus();
        }
    };

    const onSubmit = async (formData) => {
        const { mpin } = formData;
        if (petrodata.mpin === null) {
            try {
                const response = await axios.post(
                    `${base_url}/addMpin/1`,
                    {
                        "user_id": petrodata.user_id,
                        "mpin": mpin
                    }
                );

                if (response.data.status === 201 && response.data.msg === "SUCCESSFUL") {
                    navigate('/dashboard');
                } else {
                    setSetupError('Failed to set up MPIN. Please try again.');
                }
            } catch (error) {
                console.error('Error setting up MPIN:', error);
                setSetupError('Failed to set up MPIN. Please try again.');
            }
        } else {
            setSetupError("MPIN is already set");
        }
    };

    const handleback = () => {
        navigate('/mpin-login');
    };

    return (
        <div className='overflow-hidden w-full bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600  h-screen'>
            <div className='mx-auto flex flex-col justify-center gap-4 items-center h-[90vh]'>
                <form onSubmit={handleSubmit(onSubmit)} className="h-auto w-full bg-clip-padding bg-gradient-to-b from-amber-200 to-orange-400   max-w-sm  bg-opacity-20 rounded-lg shadow-lg p-5 backdrop-blur-xl backdrop-filter">
                <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="" />

                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="mpin" className="block text-center text-xl mb-2 font-semibold text-black">MPIN</label>
                        <div className="flex justify-center">
                            {mpin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (mpinRefs.current[index] = el)}
                                    type="number"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(e.target.value, index, 'mpin')}
                                    className={`w-12 h-12 mx-1 text-center text-2xl border ${errors.mpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                                />
                            ))}
                        </div>
                        {errors.mpin && <p className="text-red-500 text-md mt-1">{errors.mpin.message}</p>}
                    </div>

                    <div className="mb-6 lg:mb-8">
                        <label htmlFor="confirmMpin" className="block text-center text-xl font-semibold mb-2 text-black">Confirm MPIN</label>
                        <div className="flex justify-center">
                            {confirmMpin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (confirmMpinRefs.current[index] = el)}
                                    type="number"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handlePinChange(e.target.value, index, 'confirmMpin')}
                                    className={`w-12 h-12 mx-1 text-center text-2xl border ${errors.confirmMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                                />
                            ))}
                        </div>
                        {errors.confirmMpin && <p className="text-red-500 text-sm mt-1">{errors.confirmMpin.message}</p>}
                    </div>

                    {setupError && <p className="text-red-500 text-sm mb-4">{setupError}</p>}

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none"
                    >
                        Set MPIN
                    </button>
                </form>
                <div className='flex items-center mx-auto'>
                    <button type="button" className="w-fit p-5 mx-auto bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none"
                        onClick={handleback}>
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SetupMPIN;
