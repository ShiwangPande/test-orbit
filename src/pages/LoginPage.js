import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PhoneIcon, LockClosedIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import navlogo from "../images/loginlogo.svg"
import assest from "../images/assests.svg"
const schema = yup.object().shape({
    mobile: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

function LoginPage({ data }) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [loginError, setLoginError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const defaultpassword = '12345678';

    const onSubmit = (formData) => {
        const { mobile, password } = formData;

        if (mobile === data.mobile_no && password === defaultpassword) {
            setLoginSuccess(true);
            setLoginError('');
            setTimeout(() => {
                navigate('/noozle-reading');
            }, 1000); // Redirect after 2 seconds
        } else {
            setLoginError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>
            <div className='mx-auto flex justify-center items-center h-[90vh]'>
                {loginSuccess ? (
                    <>

                        <div id="toast-success" class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                                </svg>
                                <span class="sr-only">Check icon</span>
                            </div>
                            <div class="ms-3 text-sm font-normal">Login successfully.</div>
                        </div>

                    </>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-gradient-to-b from-amber-200	 to-orange-400	mx-5 max-w-sm p-8 rounded-lg shadow-md">
                        <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="" />
                        {/* <h2 className="text-2xl text-wheat font-bold mb-6 text-center">Login</h2> */}

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
                )}

            </div>
        </div >
    );
}

export default LoginPage;
