import React, { useState } from 'react';
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

function ResetMPIN({ petrodata }) {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [resetError, setResetError] = useState('');

    const base_url = process.env.REACT_APP_API_URL;

    const onSubmit = async (formData) => {
        const { oldMpin, newMpin } = formData;

        try {
            const response = await axios.post(
                `${base_url}/mpinRegenration/1`,
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
                        <input
                            type="password"
                            id="oldMpin"
                            {...register('oldMpin')}
                            placeholder="Enter old MPIN"
                            className={`w-full py-2 px-3 border ${errors.oldMpin ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-black`}
                        />
                        {errors.oldMpin && <p className="text-red-500 text-sm mt-1">{errors.oldMpin.message}</p>}
                    </div>

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
