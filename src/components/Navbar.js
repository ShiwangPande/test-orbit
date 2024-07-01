import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import logo from "../images/navlogo.svg";
import axios from 'axios';
import add from "../images/add.svg";

import { motion, useAnimation } from 'framer-motion';
import Logout from "../components/Logout";

function Navbar({ petrodata }) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const controls = useAnimation();
    const location = useLocation();

    useEffect(() => {
        if (showMobileMenu) {
            controls.start({ x: 0 });
        } else {
            controls.start({ x: '-80vw' });
        }
    }, [showMobileMenu, controls]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x < -50) {
            setShowMobileMenu(false);
        } else if (info.offset.x > 50) {
            setShowMobileMenu(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest('.navbar') === null) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileMenu]);
    const getPageName = (pathname) => {
        switch (pathname) {
            case '/dashboard':
                return 'Dashboard';
            case '/noozle-reading':
                return 'Noozle Reading';
            case '/credit-sale':
                return 'Credit/Cash Sale';
            case '/expenses':
                return 'Expenses';
            case '/receipt':
                return 'Receipt';
            case '/cardwallet':
                return 'Card/Wallet';
            default:
                return '';
        }
    };
    return (
        <div className='lg:mr-[17%] relative z-20'>
            {/* Desktop Navbar */}
            <div className="hidden lg:fixed h-screen md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="h-0 flex-1 flex flex-col pt-10 pb-4 overflow-y-auto bg-navbar">
                        {/* Sidebar Links */}
                        <div className="flex flex-col items-start flex-shrink-0 px-5">
                            <img
                                className="h-10 mb-5 w-auto"
                                src={logo}
                                alt="Your Company"
                            />
                            <h2 className="block    text-white text-md lg:text-xl font-normal mb-0  lg:mb-1" >Hey {petrodata.name}</h2>
                            <h2 className="block    text-white text-md lg:text-xl font-normal mb-0 lg:mb-1 italic"> {petrodata.mobile_no}</h2>
                        </div>
                        <div className="mt-2 flex-1 flex flex-col">
                            <nav className="flex-1 px-4 flex flex-col gap-7 mt-7 bg-navbar space-y-1">
                                <Link
                                    to="/dashboard"
                                    className={`block rounded-md px-3 py-2 text-md font-medium  ${window.location.pathname === '/dashboard' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/dashboard' ? 'page' : undefined}
                                >
                                    DashBoard
                                </Link>
                                <Link
                                    to="/noozle-reading"
                                    className={`block rounded-md px-3 py-2 text-md font-medium ${window.location.pathname === '/noozle-reading' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/noozle-reading' ? 'page' : undefined}
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className={`block rounded-md px-3 py-2 text-md font-medium  ${window.location.pathname === '/credit-sale' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/credit-sale' ? 'page' : undefined}
                                >
                                    Credit/Cash Sale
                                </Link>
                                {/* <Link
                                    to="/cash-sale"
                                    className={`block rounded-md px-3 py-2 text-md font-medium  ${window.location.pathname === '/cash-sale' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/cash-sale' ? 'page' : undefined}
                                >
                                    Cash Sale
                                </Link> */}
                                <Link
                                    to="/expenses"
                                    className={`block rounded-md px-3 py-2 text-md font-medium  ${window.location.pathname === '/expenses' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/expenses' ? 'page' : undefined}
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className={`block rounded-md px-3 py-2 text-md font-medium  ${window.location.pathname === '/receipt' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/receipt' ? 'page' : undefined}
                                >
                                    Receipt
                                </Link>
                                <Link
                                    to="/cardwallet"
                                    className={`block rounded-md px-3 py-2 text-md font-medium  ${window.location.pathname === '/cardwallet' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/cardwallet' ? 'page' : undefined}
                                >
                                    Card/Wallet
                                </Link>
                                <div className='px-3'>
                                    <Logout />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-0 z-40 ${showMobileMenu ? 'block' : 'hidden'}`}>
                <div className="flex items-center justify-start h-full backdrop-blur-sm">
                    <motion.div
                        className={`bg-navbar h-full fixed w-[80vw] py-5 px-8 flex flex-col navbar`}
                        initial={{ x: '-80vw' }}
                        animate={controls}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd}
                        style={{ cursor: 'grab', left: 0 }}
                    >
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                type="button"
                                className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
                                aria-controls="mobile-menu"
                                aria-expanded={showMobileMenu ? 'true' : 'false'}
                            >
                                <span className="sr-only">Close main menu</span>
                                {/* Close Icon */}
                                <svg
                                    className={`h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-1 flex-1 flex flex-col">
                            <nav className="flex-1 px-2 flex gap-[2rem] flex-col mt-8 bg-navbar space-y-1">
                                <div className="flex flex-col items-start flex-shrink-0 px-5">
                                    <img
                                        className="h-9 mx-auto w-auto mb-5"
                                        src={logo}
                                        alt="Your Company"
                                    />
                                    <h2 className="block    text-white text-md lg:text-xl font-normal mb-0  lg:mb-1" >Hey {petrodata.name}</h2>
                                    <h2 className="block    text-white text-md lg:text-xl font-normal mb-0 lg:mb-1 italic"> {petrodata.mobile_no}</h2>
                                </div>
                                <Link
                                    to="/dashboard"
                                    className={`block rounded-md px-3 py-2 text-lg font-medium ${window.location.pathname === '/dashboard' ? 'bg-wheat text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    aria-current={window.location.pathname === '/dashboard' ? 'page' : undefined}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/noozle-reading"
                                    className={`block rounded-md px-3 py-2 text-lg font-medium ${window.location.pathname === '/noozle-reading' ? 'bg-wheat text-black' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    aria-current={window.location.pathname === '/noozle-reading' ? 'page' : undefined}
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className={`block rounded-md px-3 py-2 text-lg font-medium  ${window.location.pathname === '/credit-sale' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/credit-sale' ? 'page' : undefined}
                                >
                                    Credit/Cash Sale
                                </Link>
                                {/* <Link
                                    to="/cash-sale"
                                    className={`block rounded-md px-3 py-2 text-lg font-medium  ${window.location.pathname === '/cash-sale' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/cash-sale' ? 'page' : undefined}
                                >
                                    Cash Sale
                                </Link> */}
                                <Link
                                    to="/expenses"
                                    className={`block rounded-md px-3 py-2 text-lg font-medium  ${window.location.pathname === '/expenses' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/expenses' ? 'page' : undefined}
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className={`block rounded-md px-3 py-2 text-lg font-medium  ${window.location.pathname === '/receipt' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/receipt' ? 'page' : undefined}
                                >
                                    Receipt
                                </Link>
                                <Link
                                    to="/cardwallet"
                                    className={`block rounded-md px-3 py-2 text-lg font-medium  ${window.location.pathname === '/cardwallet' ? 'bg-wheat text-black' : 'hover:bg-gray-700 text-white'}`}
                                    aria-current={window.location.pathname === '/cardwallet' ? 'page' : undefined}
                                >
                                    Card/Wallet
                                </Link>
                                <div className='px-3'>
                                    <Logout />
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Hamburger Icon for Mobile */}
            <div className="flex flex-col ml-0 lg:ml-[17%] mix-blend-overlay   fixed z-50  w-0 flex-1 overflow-hidden">
                <div className="w-screen  flex-shrink-0 fixed z-50	  flex h-14 bg-navbar  border-black lg:hidden">
                    <h1 className='block fixed w-[80vw] lg:hidden text-white mx-10 text-center top-4 text-2xl z-50'>{getPageName(location.pathname)}</h1>


                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        type="button"
                        className="inline-flex items-center  justify-center p-2 text-gray-400 rounded-md focus:outline-none focus:white focus:ring-inset focus:white"
                        aria-controls="mobile-menu"
                        aria-expanded={showMobileMenu ? 'true' : 'false'}
                    >
                        <span className="sr-only">Open main menu</span>
                        {/* Hamburger Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? 'hidden' : 'block'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        {/* Close Icon */}
                        <svg
                            className={`block h-6 w-6 ${showMobileMenu ? 'block' : 'hidden'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
