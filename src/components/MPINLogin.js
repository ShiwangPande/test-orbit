import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import navlogo from "../images/loginlogo.svg";
import axios from 'axios';
import LoginPage from '../pages/LoginPage';
const mpinSchema = yup.object().shape({
    mpin: yup.string().required('MPIN is required').matches(/^[0-9]{4}$/, 'MPIN must be 4 digits'),
});

function MPINLogin({ petrodata }) {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(mpinSchema),
    });

    const [loginError, setLoginError] = useState('');
    const base_url = process.env.REACT_APP_API_URL;

    const onMPINSubmit = async (formData) => {
        const { mpin } = formData;

        try {
            const response = await axios.post(
                `${base_url}/mpinCheck/1`,
                {
                    "user_id": petrodata.user_id,
                    "mpin": mpin,
                }
            );

            if (response.data.status === 200 && response.data.msg === "CHECKED") {
                navigate('/dashboard');
            } else {
                setLoginError('Incorrect MPIN. Please try again.');
            }
        } catch (error) {
            console.error('Error during MPIN login:', error);
            setLoginError('An error occurred. Please try again.');
        }
    };

    const handleForget = () => {
        navigate("/reset-mpin");
    };
    const handleSetup = () => {
        navigate("/setup-mpin");
    };
    const handlelogin = () => {
        navigate("/login");
    };

    return (

        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>

            <div className='mx-auto flex justify-center items-center  h-[90vh]'>
                <form onSubmit={handleSubmit(onMPINSubmit)} className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-8 rounded-lg shadow-md">
                    <img className='mt-5 mb-8 mx-auto' src={navlogo} alt="" />
                    <h1 className='text-xl text-center font-bold'>Hello {petrodata.name}</h1>
                    <div className="mb-4 mt-4 lg:mb-8">
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
                    <div className='flex items-start mt-3 justify-between'>

                        <button type="button" className='mt-3 font-bold' onClick={handleSetup}>
                            Setup MPIN
                        </button>

                        <button type="button" className='mt-3 font-bold' onClick={handleForget}>
                            Change MPIN
                        </button>

                    </div>
                    <hr className='my-5 border-1   border-gray-200' />
                    <div className='flex items-center  mx-auto'>
                        <button type="button" className="mt-3 font-bold mx-auto rounded-lg px-2 outline-double outline-3 outline-offset-2"
                            onClick={handlelogin}>
                            Login with another Account
                        </button>
                    </div>
                </form>

            </div>

        </div>

    );
}

export default MPINLogin;
