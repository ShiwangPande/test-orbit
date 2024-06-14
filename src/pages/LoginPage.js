import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ data }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const defaultpassword = '12345678'
    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if entered username and password match the user's data
        if (username === data.mobile_no && password === defaultpassword) {
            // Authentication successful
            alert('Login successful!');
            navigate('/noozle-reading');
        } else {
            // Authentication failed
            alert('Invalid username or password. Please try again.');
            // Clear the form fields
            setUsername('');
            setPassword('');
        }
    };

    return (
        <div>
            <div className='overflow-hidden bg-[#EEEEEE] h-screen'>
                <nav className='bg-[#151515]'>
                    <div className="flex justify-between items-center h-16 w-full  rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10  text-[#EEEEEE] relative shadow-sm font-sans font-bold text-xl">
                        {data && (
                            <div className="pl-8"  > {data.petro_name} </div>
                        )}
                    </div>
                </nav>
                <div className=' mx-auto flex justify-center items-center h-[90vh]  '>
                    <div className='bg-[#c18516] text-[#EEEEEE] border-2 border-[#151515]  rounded-lg p-10'>
                        <h1 className='text-2xl text-center  my-7'>Admin Login</h1>
                        <form onSubmit={handleSubmit} className='flex flex-col space-y-5'>
                            <input type='text' value={username} placeholder='Username' className='p-2 text-[#151515]' onChange={(e) => setUsername(e.target.value)} />
                            <input type='password' value={password} placeholder='Password' className='p-2 text-[#151515]' onChange={(e) => setPassword(e.target.value)} />
                            <button type="submit" className='bg-[#151515] text-[#EEEEEE] rounded p-2'>Login</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
