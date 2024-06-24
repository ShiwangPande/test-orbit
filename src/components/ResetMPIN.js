import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import navlogo from "../images/loginlogo.svg";

const schema = yup.object().shape({
    mobile: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    otp: yup.string().required('OTP is required').matches(/^[0-9]{6}$/, 'OTP must be 6 digits'),
    newMpin: yup.string().required('New MPIN is required').matches(/^[0-9]{4}$/, 'New MPIN must be 4 digits'),
    confirmMpin: yup.string().oneOf([yup.ref('newMpin'), null], 'MPINs must match')
});

function ResetMPIN() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [resetError, setResetError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const onSubmit = (formData) => {
        const { mobile, otp, newMpin } = formData;
        // Implement OTP verification logic here
        // For demo purposes, let's assume OTP verification is successful
        // Replace with actual verification logic using APIs, etc.

        // Once OTP verification is successful, update MPIN in localStorage
        localStorage.setItem(`${mobile}_mpin`, newMpin);
        navigate('/mpin-login', { state: { mobile } });
    };

    const handleSendOTP = () => {
        // Implement OTP sending logic here
        // For demo purposes, just setting otpSent to true
        setOtpSent(true);
    };

    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>
            <div className='mx-auto flex justify-center items-center h-[90vh]'>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-8 rounded-lg shadow-md">
                    <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="" />

                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="mobile" className="block mb-1 text-black">Mobile Number</label>
                        <input
                            type="number"
                            id="mobile"
                            {...register('mobile')}
                            placeholder="Enter your mobile number"
                            className={`w-full py-2 px-3 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                        />
                        {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                    </div>

                    {!otpSent && (
                        <button
                            type="button"
                            className="w-full bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none"
                            onClick={handleSendOTP}
                        >
                            Send OTP
                        </button>
                    )}

                    {otpSent && (
                        <div className="mb-4 lg:mb-8">
                            <label htmlFor="otp" className="block mb-1 text-black">OTP</label>
                            <input
                                type="number"
                                id="otp"
                                {...register('otp')}
                                placeholder="Enter OTP"
                                className={`w-full py-2 px-3 border ${errors.otp ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                            />
                            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
                        </div>
                    )}

                    {otpSent && (
                        <>
                            <div className="mb-4 lg:mb-8">
                                <label htmlFor="newMpin" className="block mb-1 text-black">New MPIN</label>
                                <input
                                    type="password"
                                    id="newMpin"
                                    {...register('newMpin')}
                                    placeholder="Enter new MPIN"
                                    className={`w-full py-2 px-3 border ${errors.newMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                                />
                                {errors.newMpin && <p className="text-red-500 text-sm mt-1">{errors.newMpin.message}</p>}
                            </div>

                            <div className="mb-6 lg:mb-8">
                                <label htmlFor="confirmMpin" className="block mb-1 text-black">Confirm MPIN</label>
                                <input
                                    type="password"
                                    id="confirmMpin"
                                    {...register('confirmMpin')}
                                    placeholder="Confirm new MPIN"
                                    className={`w-full py-2 px-3 border ${errors.confirmMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                                />
                                {errors.confirmMpin && <p className="text-red-500 text-sm mt-1">{errors.confirmMpin.message}</p>}
                            </div>
                        </>
                    )}

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
