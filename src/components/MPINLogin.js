import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import navlogo from "../images/loginlogo.svg";
import LoginPage from '../pages/LoginPage';

const mpinSchema = yup.object().shape({
    mpin: yup.string().required('MPIN is required').matches(/^[0-9]{4}$/, 'MPIN must be 4 digits'),
});

function MPINLogin({ setIsAuthenticated, data }) {
    const navigate = useNavigate();
    const location = useLocation();
    const mobile = location.state?.mobile;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(mpinSchema),
    });
    const storedMpin = localStorage.getItem(`${mobile}_mpin`);
    const [loginError, setLoginError] = useState('');

    const onMPINSubmit = (formData) => {
        const { mpin } = formData;
        const storedMpin = localStorage.getItem(`${mobile}_mpin`);

        if (mpin === storedMpin) {
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true'); // Store authentication status in local storage
            navigate('/dashboard'); // Redirect to dashboard after successful authentication
            // Check if MPIN is already set up
        } else {
            setLoginError('Invalid MPIN. Please try again.');
        }
    };


    const handleforget = () => {
        navigate("/login")
    }


    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>

            <div className='mx-auto flex justify-center items-center h-[90vh]'>
                {storedMpin ? (
                    <form onSubmit={handleSubmit(onMPINSubmit)} className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-8 rounded-lg shadow-md">
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

                        {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none"
                        >
                            Login with MPIN
                        </button>
                        <button className='mt-3 font-bold' onClick={handleforget}>
                            Forget? Reset pin
                        </button>
                    </form>
                ) : (
                    <Navigate to="/login" />
                )}
            </div>
        </div>
    );
}

export default MPINLogin;

