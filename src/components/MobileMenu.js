import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import Logout from './Logout'; // Assuming you have a Logout component
import logo from '../images/navlogo.svg'; // Assuming you have a logo image

const MobileMenu = ({ showMobileMenu, setShowMobileMenu }) => {
    const controls = useAnimation();

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

    return (
        <>
            {/* Sidebar */}
            <div className="hidden lg:fixed h-screen md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="h-0 flex-1 flex flex-col pt-10 pb-4 overflow-y-auto bg-navbar">
                        {/* Sidebar Links */}
                        <div className="flex items-center flex-shrink-0 px-4">
                            <img
                                className="h-10 mx-auto w-auto"
                                src={logo}
                                alt="Your Company"
                            />
                        </div>
                        <div className="mt-5 flex-1 flex flex-col">
                            <nav className="flex-1 px-4 flex flex-col gap-10 mt-7 bg-navbar space-y-1">
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="bg-wheat text-black block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-md font-medium"
                                >
                                    Receipt
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
                        className={`bg-navbar h-full fixed w-[80vw] p-8 flex flex-col navbar`}
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
                        <div className="mt-2 flex-1 flex flex-col">
                            <nav className="flex-1 px-2 flex gap-[3rem] flex-col mt-8 bg-navbar space-y-1">
                                <div className="flex items-center flex-shrink-0 px-4">
                                    <img
                                        className="h-10 mx-auto w-auto"
                                        src={logo}
                                        alt="Your Company"
                                    />
                                </div>
                                <Link
                                    to="/noozle-reading"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                    aria-current="page"
                                >
                                    Noozle reading
                                </Link>
                                <Link
                                    to="/credit-sale"
                                    className="bg-wheat text-black block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Credit Sale
                                </Link>
                                <Link
                                    to="/cash-sale"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Cash Sale
                                </Link>
                                <Link
                                    to="/expenses"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Expenses
                                </Link>
                                <Link
                                    to="/receipt"
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-lg font-medium"
                                >
                                    Receipt
                                </Link>
                                <div className='px-3'>
                                    <Logout />
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;
