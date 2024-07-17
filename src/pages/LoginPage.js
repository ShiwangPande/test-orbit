import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { PhoneIcon, LockClosedIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import navlogo from "../images/loginlogo.svg";
import SetupMPIN from '../components/SetupMPIN';

const schema = yup.object().shape({
    mobile: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    financialYear: yup.string().required('Financial year is required'),
});

function LoginPage({ setIsAuthenticated, setUserMobile, setData, setFinancialYear }) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [financialYears, setFinancialYears] = useState({});
    const [defaultFinancialYear, setDefaultFinancialYear] = useState('');

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            financialYear: '',
        },
    });

    const base_url = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFinancialYears = async () => {
            try {
                const response = await axios.get(`${base_url}/financialYearDropList`);
                if (response.data.status === 200) {
                    setFinancialYears(response.data.data);
                    const firstKey = Object.keys(response.data.data)[0];
                    setDefaultFinancialYear(firstKey);
                    setValue('financialYear', firstKey);
                }
            } catch (error) {
                console.error('Error fetching financial years:', error);
            }
        };
        fetchFinancialYears();
    }, [base_url, setValue]);

    const onSubmit = async (formData) => {
        const { mobile, password, financialYear } = formData;

        try {
            const response = await axios.post(
                `${base_url}/login/${financialYear}`,
                {
                    "mobile_no": mobile,
                    "password": password
                }
            );

            console.log('Login successful. Data:', response.data);

            if (response.data.status === 200 && response.data.msg === "VERIFIED_USER") {
                setUserMobile(mobile);
                setData(response.data);
                setIsAuthenticated(true);
                setFinancialYear(financialYear);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userMobile', mobile);
                localStorage.setItem('financialYear', financialYear);
                localStorage.setItem('userData', JSON.stringify(response.data));
                if (response.data.mpin === null) {
                    navigate("/setup-mpin")
                }
                else {
                    navigate("/mpin-login");
                }
            } else {
                setLoginError('Mobile number or password is incorrect. Please try again.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setLoginError('Failed to log in. Please try again.');
        }
    };

    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>
            <div className='mx-auto flex justify-center items-center h-[90vh]'>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-8 rounded-lg shadow-md">
                    <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="Logo" />
                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="mobile" className="block mb-1 text-black">Mobile Number</label>
                        <div className="relative">
                            <input autoComplete="off"
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

                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="password" className="block mb-1 text-black">Password</label>
                        <div className="relative">
                            <input autoComplete="off"
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

                    <div className="mb-4 lg:mb-8">
                        <label htmlFor="financialYear" className="block mb-1 text-black">Financial Year</label>
                        <div className="relative">
                            <Controller
                                name="financialYear"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        id="financialYear"
                                        className={`w-full py-2 pl-3 pr-3 border ${errors.financialYear ? 'border-red-500' : 'border-gray-300'} font-sans text-black rounded-lg focus:outline-none focus:border-black`}
                                    >
                                        <option value="">Select Financial Year</option>
                                        {Object.keys(financialYears).map((key) => (
                                            <option key={key} value={key}>{financialYears[key]}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>
                        {errors.financialYear && <p className="text-red-500 text-sm mt-1">{errors.financialYear.message}</p>}
                    </div>

                    {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
