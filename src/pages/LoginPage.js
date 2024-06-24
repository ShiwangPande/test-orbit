import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PhoneIcon, LockClosedIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import navlogo from "../images/loginlogo.svg";
import SetupMPIN from '../components/SetupMPIN';
import MPINLogin from '../components/MPINLogin';

const schema = yup.object().shape({
    mobile: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

function LoginPage({ data, setIsAuthenticated }) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isMPINSetup, setIsMPINSetup] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const defaultpassword = '12345678';

    const onSubmit = (formData) => {
        const { mobile, password } = formData;

        if (mobile === data.mobile_no && password === defaultpassword) {
            setIsAuthenticated(true);

            // Check if MPIN is already set up
            const storedMpin = localStorage.getItem(`${mobile}_mpin`);
            if (storedMpin) {
                navigate('/setup-mpin', { state: { mobile } }); // Redirect to MPIN login
            } else {
                setIsMPINSetup(true);
            }
        } else {
            setLoginError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>
            <div className='mx-auto flex justify-center items-center h-[90vh]'>
                {!isMPINSetup ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-8 rounded-lg shadow-md">
                        <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="" />

                        <div className="mb-4 lg:mb-8">
                            <label htmlFor="mobile" className="block mb-1 text-black">Mobile Number</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="mobile"
                                    {...register('mobile')}
                                    placeholder="Enter your mobile number"
                                    className={`w-full py-2 pl-10 pr-3 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} font-sans text-black rounded-lg focus:outline-none focus:border-black`}
                                />
                                <PhoneIcon className="absolute w-5 h-5 text-gray-500 left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                        </div>

                        <div className="mb-6 lg:mb-8">
                            <label htmlFor="password" className="block mb-1 text-black">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    {...register('password')}
                                    placeholder="Enter your password"
                                    className={`w-full py-2 pl-10 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} font-sans text-black rounded-lg focus:outline-none focus:border-black`}
                                />
                                <LockClosedIcon className="absolute w-5 h-5 text-gray-500 left-3 top-1/2 transform -translate-y-1/2" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                >
                                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none"
                        >
                            Login
                        </button>
                    </form>
                ) : (
                    <SetupMPIN mobile={data.mobile_no} />
                )}
            </div>
        </div>
    );
}

export default LoginPage;
