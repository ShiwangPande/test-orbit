import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import navlogo from "../images/loginlogo.svg";

const mpinSchema = yup.object().shape({
    mpin: yup.string().required('MPIN is required').matches(/^[0-9]{4}$/, 'MPIN must be 4 digits'),
    confirmMpin: yup.string().oneOf([yup.ref('mpin'), null], 'MPINs must match')
});

function SetupMPIN({ mobile }) {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(mpinSchema),
    });
    const [setupError, setSetupError] = useState('');

    const onSubmit = (formData) => {
        const { mpin } = formData;

        // Save MPIN securely
        localStorage.setItem(`${mobile}_mpin`, mpin);
        navigate('/dashboard');
    };

    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>
            <div className='mx-auto flex justify-center items-center h-[90vh]'>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-8 rounded-lg shadow-md">
                    <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="" />

                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="mpin" className="block mb-1 text-black">MPIN</label>
                        <input
                            type="password"
                            id="mpin"
                            {...register('mpin')}
                            placeholder="Enter your MPIN"
                            className={`w-full py-2 px-3 border ${errors.mpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                        />
                        {errors.mpin && <p className="text-red-500 text-sm mt-1">{errors.mpin.message}</p>}
                    </div>

                    <div className="mb-6 lg:mb-8">
                        <label htmlFor="confirmMpin" className="block mb-1 text-black">Confirm MPIN</label>
                        <input
                            type="password"
                            id="confirmMpin"
                            {...register('confirmMpin')}
                            placeholder="Confirm your MPIN"
                            className={`w-full py-2 px-3 border ${errors.confirmMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                        />
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
            </div>
        </div>
    );
}

export default SetupMPIN;
