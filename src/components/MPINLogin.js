import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import navlogo from "../images/loginlogo.svg";
import axios from 'axios';

const mpinSchema = yup.object().shape({
    mpin: yup.string().required('MPIN is required').matches(/^[0-9]{4}$/, 'MPIN must be 4 digits'),
});

const DigitalKeyboard = ({ onKeyPress, onBackspace, onClose }) => {
    // const [keys, setKeys] = useState([]);

    // useEffect(() => {
    //     const shuffledKeys = [...Array(10).keys()].sort();
    //     setKeys(shuffledKeys);
    // }, []);


    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return (
        <div className="grid grid-cols-3 mx-auto">

            {keys.map((key) => (
                <button
                    key={key}
                    className="w-full p-2 h-full col-span-1 mx-auto my-1 text-center text-xl border hover:bg-wheat hover:text-black hover:border-wheat border-wheat  focus:outline-none"
                    onClick={() => onKeyPress(key)}
                >
                    {key}
                </button>
            ))}
            <button
                className="w-full p-1  h-full col-span-1 mx-auto my-1 text-black  text-center text-3xl border hover:bg-wheat hover:text-black hover:border-wheat border-wheat focus:outline-none"
                onClick={onClose}
            >
                ←  </button>

            <button
                className="w-full p-2  h-full col-span-1 mx-auto my-1 text-center text-xl border hover:bg-wheat hover:text-black hover:border-wheat border-wheat focus:outline-none"
                onClick={() => onKeyPress(0)}
            >
                0
            </button>
            <button
                className="w-full p-2  h-full col-span-1 mx-auto my-1 text-center  text-xl border hover:bg-wheat hover:text-black hover:border-wheat border-wheat focus:outline-none"
                onClick={onBackspace}
            >
                ⌫
            </button>
        </div>
    );
};

function MPINLogin({ petrodata, financialYear }) {
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(mpinSchema),
    });

    const [loginError, setLoginError] = useState('');
    const [mpin, setMpin] = useState(['', '', '', '']);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const base_url = process.env.REACT_APP_API_URL;
    const dsm_url = process.env.REACT_APP_DSM_URL;
    const onMPINSubmit = async () => {
        const mpinValue = mpin.join('');
        console.log('Submitting MPIN:', mpinValue); // Debug log for MPIN value

        if (mpinValue.length !== 4) {
            setLoginError('MPIN must be 4 digits');
            return;
        }

        try {
            const response = await axios.post(`${base_url}/mpinCheck/${financialYear}`, {
                user_id: petrodata.user_id,
                mpin: mpinValue,
            });

            console.log('API Response:', response.data); // Debug log for API response

            if (response.data.status === 200 && response.data.msg === "CHECKED") {
                navigate(`${dsm_url}/dashboard`);
            } else {
                setLoginError('Incorrect MPIN. Please try again.');
            }
        } catch (error) {
            console.error('Error during MPIN login:', error);
            setLoginError('An error occurred. Please try again.');
        }
    };

    const handleForget = () => navigate(`${dsm_url}reset-mpin`);
    const handleSetup = () => navigate(`${dsm_url}/setup-mpin`);
    const handleLogin = () => navigate(`${dsm_url}/login`);

    const handlePinChange = (value, index) => {
        const newMpin = [...mpin];
        newMpin[index] = value;
        setMpin(newMpin);
        setValue('mpin', newMpin.join(''), { shouldValidate: true });

        if (value === '') {
            if (index > 0 && inputRefs.current[index - 1]) {
                inputRefs.current[index - 1].focus();
            }
        } else {
            if (index < 3 && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus();
            }
        }
        if (index === 4) {
            setTimeout(() => handleSubmit(onMPINSubmit)(), 500); // Submit form if MPIN is complete
        }
    };

    const handleKeyPress = (key) => {
        for (let i = 0; i < mpin.length; i++) {
            if (mpin[i] === '') {
                handlePinChange(key.toString(), i);
                break;
            }
        }
    };

    const handleBackspace = () => {
        for (let i = mpin.length - 1; i >= 0; i--) {
            if (mpin[i] !== '') {
                handlePinChange('', i);
                break;
            }
        }
    };

    const handleCloseKeyboard = () => setKeyboardVisible(false);

    return (
        <div className='overflow-hidden bg-gradient-to-t from-gray-200 via-gray-400 to-gray-600 h-screen'>
            <div className='mx-auto flex flex-col justify-center items-center h-screen'>
                <div className="w-full bg-gradient-to-b from-amber-200 to-orange-400 mx-5 max-w-sm p-3 rounded-t-lg shadow-md">
                    <form onSubmit={handleSubmit(onMPINSubmit)}>
                        <img className='mt-5 mb-5 mx-auto' src={navlogo} alt="Login Logo" />
                        <div className='p-3'>
                            <div className="mb-4 mt-4 mx-auto lg:mb-8">
                                <h1 className='text-2xl text-center font-bold'>Welcome {petrodata.name}</h1>
                                <label htmlFor="mpin" className="block text-center text-xl mt-3 font-semibold mb-2 text-black">
                                    Enter MPIN
                                </label>
                                <div className="flex justify-center">
                                    {mpin.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onClick={() => setKeyboardVisible(true)}
                                            readOnly
                                            className={`w-12 h-12 mx-1 text-center text-2xl border ${errors.mpin ? 'border-red-500' : 'border-wheat'} rounded-lg focus:outline-none focus:border-black`}
                                        />
                                    ))}
                                </div>
                                {errors.mpin && <p className="text-red-500 text-sm mt-1">{errors.mpin.message}</p>}
                            </div>
                            {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
                            {!keyboardVisible && (
                                <>
                                    <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:bg-black focus:outline-none mt-3">
                                        Login with MPIN
                                    </button>
                                    <div className='flex items-start mt-3 justify-between'>
                                        <button type="button" className='mt-3 underline underline-offset-4 hover:decoration-2 font-bold' onClick={handleForget}>
                                            Change MPIN
                                        </button>
                                    </div>
                                    <hr className='my-5 border-1 border-gray-200' />
                                    <div className='flex items-center mx-auto'>
                                        <button type="button" className="mt-3 font-bold mx-auto rounded-lg px-2 outline-double outline-3 outline-offset-2 hover:outline-offset-3 hover:outline-4"
                                            onClick={handleLogin}>
                                            Switch Account
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {keyboardVisible && (
                            <DigitalKeyboard
                                onKeyPress={handleKeyPress}
                                onBackspace={handleBackspace}
                                onClose={handleCloseKeyboard}
                            />
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
}

export default MPINLogin;
