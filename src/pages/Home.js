import React from "react";
import Logo from "../images/logo.svg";
import nozzle from "../images/nozzle.png";
import arrow from "../images/arrow.svg";
import { motion } from 'framer-motion';
import nozzlee from "../images/nozzlee.png";
import { useNavigate } from "react-router-dom";
import wave from "../images/wave.svg";
function Home({ petrodata }) {
    const navigate = useNavigate();
    const handleclick = () => {
        navigate("/mpin-login");
    };

    const floatVariants = {
        float: {
            y: [0, -5, 0], // Move up by 5px and then back down for subtle motion
            scale: [1, 1.08, 1], // Scale up by 5% and then back to original size
            transition: {
                duration: 3,   // Duration of one cycle of the animation
                ease: 'easeInOut',
                repeat: Infinity, // Repeat the animation infinitely
                repeatType: 'loop',
            },
        },
    };
    return (
        <div className="h-screen home bg-wheat overflow-hidden" >
            <div className=" w-screen  flex justify-center flex-col items-center">
                <img className="mt-10 w-32 h-32 lg:w-52 lg:h-52" src={Logo} alt="" />
                <div className="mt-20 flex flex-col lg:flex-row gap-3  mx-3 text-center  my-5">
                    <h2 className="text-[1.8rem] lg:text-5xl font-semibold">
                        Welcome to{" "}
                    </h2>
                    <h1 className="font-bold text-4xl lg:text-5xl">
                        {" "}

                        {petrodata ? (
                            <>
                                {petrodata.petro_name}
                            </>
                        ) : (
                            <>
                                Bizperto DSM App
                            </>
                        )}
                    </h1>
                </div>

                <img
                    className="absolute z-10 left-[-44px] lg:left-[20px] w-72 rotate-[18deg] top-[55%] "
                    src={nozzlee}
                    alt=""
                />
                <motion.button
                    variants={floatVariants}
                    animate="float"
                    className="p-3 drop-shadow-2xl	 block w-[5rem] h-[5rem] shadow-lg backdrop-contrast-200 absolute z-10 bottom-20 border-5 border-wheat bg-black rounded-full right-10 m-3 lg:m-7 font-bold"

                >
                    <button
                        onClick={handleclick}
                    >
                        <img src={arrow} alt="" />
                    </button>
                </motion.button>
            </div>
            <div className="lg:absolute lg:block hidden opacity-90 w-screen bottom-0">
                <svg
                    id="wave"
                    style={{ transform: "rotate(0deg)", transition: "0.3s" }}
                    viewBox="0 0 1440 490"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
                            <stop stop-color="rgba(243, 106, 62, 0.5)" offset="0%"></stop>
                            <stop stop-color="rgba(255, 179, 11, 0.58)" offset="100%"></stop>
                        </linearGradient>
                    </defs>
                    <path
                        style={{ transform: "translate(0, 0px)", opacity: 1 }}
                        fill="url(#sw-gradient-0)"
                        d="M0,49L120,106.2C240,163,480,278,720,326.7C960,376,1200,359,1440,326.7C1680,294,1920,245,2160,204.2C2400,163,2640,131,2880,114.3C3120,98,3360,98,3600,106.2C3840,114,4080,131,4320,171.5C4560,212,4800,278,5040,285.8C5280,294,5520,245,5760,212.3C6000,180,6240,163,6480,130.7C6720,98,6960,49,7200,98C7440,147,7680,294,7920,359.3C8160,425,8400,408,8640,400.2C8880,392,9120,392,9360,359.3C9600,327,9840,261,10080,212.3C10320,163,10560,131,10800,163.3C11040,196,11280,294,11520,294C11760,294,12000,196,12240,187.8C12480,180,12720,261,12960,269.5C13200,278,13440,212,13680,204.2C13920,196,14160,245,14400,228.7C14640,212,14880,131,15120,155.2C15360,180,15600,310,15840,302.2C16080,294,16320,147,16560,98C16800,49,17040,98,17160,122.5L17280,147L17280,490L17160,490C17040,490,16800,490,16560,490C16320,490,16080,490,15840,490C15600,490,15360,490,15120,490C14880,490,14640,490,14400,490C14160,490,13920,490,13680,490C13440,490,13200,490,12960,490C12720,490,12480,490,12240,490C12000,490,11760,490,11520,490C11280,490,11040,490,10800,490C10560,490,10320,490,10080,490C9840,490,9600,490,9360,490C9120,490,8880,490,8640,490C8400,490,8160,490,7920,490C7680,490,7440,490,7200,490C6960,490,6720,490,6480,490C6240,490,6000,490,5760,490C5520,490,5280,490,5040,490C4800,490,4560,490,4320,490C4080,490,3840,490,3600,490C3360,490,3120,490,2880,490C2640,490,2400,490,2160,490C1920,490,1680,490,1440,490C1200,490,960,490,720,490C480,490,240,490,120,490L0,490Z"
                    ></path>
                    <defs>
                        <linearGradient id="sw-gradient-1" x1="0" x2="0" y1="1" y2="0">
                            <stop stop-color="rgba(243, 106, 62, 0.5)" offset="0%"></stop>
                            <stop stop-color="rgba(255, 179, 11, 0.58)" offset="100%"></stop>
                        </linearGradient>
                    </defs>
                    <path
                        style={{ transform: "translate(0, 50px)", opacity: "0.9" }}
                        fill="url(#sw-gradient-1)"
                        d="M0,245L120,277.7C240,310,480,376,720,392C960,408,1200,376,1440,343C1680,310,1920,278,2160,228.7C2400,180,2640,114,2880,130.7C3120,147,3360,245,3600,269.5C3840,294,4080,245,4320,228.7C4560,212,4800,229,5040,261.3C5280,294,5520,343,5760,367.5C6000,392,6240,392,6480,351.2C6720,310,6960,229,7200,212.3C7440,196,7680,245,7920,245C8160,245,8400,196,8640,179.7C8880,163,9120,180,9360,187.8C9600,196,9840,196,10080,220.5C10320,245,10560,294,10800,326.7C11040,359,11280,376,11520,359.3C11760,343,12000,294,12240,261.3C12480,229,12720,212,12960,228.7C13200,245,13440,294,13680,310.3C13920,327,14160,310,14400,318.5C14640,327,14880,359,15120,375.7C15360,392,15600,392,15840,383.8C16080,376,16320,359,16560,302.2C16800,245,17040,147,17160,98L17280,49L17280,490L17160,490C17040,490,16800,490,16560,490C16320,490,16080,490,15840,490C15600,490,15360,490,15120,490C14880,490,14640,490,14400,490C14160,490,13920,490,13680,490C13440,490,13200,490,12960,490C12720,490,12480,490,12240,490C12000,490,11760,490,11520,490C11280,490,11040,490,10800,490C10560,490,10320,490,10080,490C9840,490,9600,490,9360,490C9120,490,8880,490,8640,490C8400,490,8160,490,7920,490C7680,490,7440,490,7200,490C6960,490,6720,490,6480,490C6240,490,6000,490,5760,490C5520,490,5280,490,5040,490C4800,490,4560,490,4320,490C4080,490,3840,490,3600,490C3360,490,3120,490,2880,490C2640,490,2400,490,2160,490C1920,490,1680,490,1440,490C1200,490,960,490,720,490C480,490,240,490,120,490L0,490Z"
                    ></path>
                    <defs>
                        <linearGradient id="sw-gradient-2" x1="0" x2="0" y1="1" y2="0">
                            <stop stop-color="rgba(243, 106, 62, 0.5)" offset="0%"></stop>
                            <stop stop-color="rgba(255, 179, 11, 0.58)" offset="100%"></stop>
                        </linearGradient>
                    </defs>
                    <path
                        style={{ transform: "translate(0, 100px)", opacity: "0.8" }}
                        fill="url(#sw-gradient-2)"
                        d="M0,196L120,228.7C240,261,480,327,720,302.2C960,278,1200,163,1440,163.3C1680,163,1920,278,2160,318.5C2400,359,2640,327,2880,334.8C3120,343,3360,392,3600,383.8C3840,376,4080,310,4320,245C4560,180,4800,114,5040,114.3C5280,114,5520,180,5760,212.3C6000,245,6240,245,6480,253.2C6720,261,6960,278,7200,277.7C7440,278,7680,261,7920,212.3C8160,163,8400,82,8640,114.3C8880,147,9120,294,9360,367.5C9600,441,9840,441,10080,400.2C10320,359,10560,278,10800,277.7C11040,278,11280,359,11520,359.3C11760,359,12000,278,12240,228.7C12480,180,12720,163,12960,196C13200,229,13440,310,13680,294C13920,278,14160,163,14400,114.3C14640,65,14880,82,15120,98C15360,114,15600,131,15840,163.3C16080,196,16320,245,16560,269.5C16800,294,17040,294,17160,294L17280,294L17280,490L17160,490C17040,490,16800,490,16560,490C16320,490,16080,490,15840,490C15600,490,15360,490,15120,490C14880,490,14640,490,14400,490C14160,490,13920,490,13680,490C13440,490,13200,490,12960,490C12720,490,12480,490,12240,490C12000,490,11760,490,11520,490C11280,490,11040,490,10800,490C10560,490,10320,490,10080,490C9840,490,9600,490,9360,490C9120,490,8880,490,8640,490C8400,490,8160,490,7920,490C7680,490,7440,490,7200,490C6960,490,6720,490,6480,490C6240,490,6000,490,5760,490C5520,490,5280,490,5040,490C4800,490,4560,490,4320,490C4080,490,3840,490,3600,490C3360,490,3120,490,2880,490C2640,490,2400,490,2160,490C1920,490,1680,490,1440,490C1200,490,960,490,720,490C480,490,240,490,120,490L0,490Z"
                    ></path>
                    <defs>
                        <linearGradient id="sw-gradient-3" x1="0" x2="0" y1="1" y2="0">
                            <stop stop-color="rgba(243, 106, 62, 0.5)" offset="0%"></stop>
                            <stop stop-color="rgba(255, 179, 11, 0.58)" offset="100%"></stop>
                        </linearGradient>
                    </defs>
                    <path
                        style={{ transform: "translate(0, 150px)", opacity: "0.7" }}
                        fill="url(#sw-gradient-3)"
                        d="M0,147L120,163.3C240,180,480,212,720,204.2C960,196,1200,147,1440,179.7C1680,212,1920,327,2160,375.7C2400,425,2640,408,2880,408.3C3120,408,3360,425,3600,359.3C3840,294,4080,147,4320,98C4560,49,4800,98,5040,147C5280,196,5520,245,5760,277.7C6000,310,6240,327,6480,294C6720,261,6960,180,7200,138.8C7440,98,7680,98,7920,114.3C8160,131,8400,163,8640,147C8880,131,9120,65,9360,40.8C9600,16,9840,33,10080,49C10320,65,10560,82,10800,106.2C11040,131,11280,163,11520,155.2C11760,147,12000,98,12240,98C12480,98,12720,147,12960,163.3C13200,180,13440,163,13680,196C13920,229,14160,310,14400,294C14640,278,14880,163,15120,106.2C15360,49,15600,49,15840,81.7C16080,114,16320,180,16560,228.7C16800,278,17040,310,17160,326.7L17280,343L17280,490L17160,490C17040,490,16800,490,16560,490C16320,490,16080,490,15840,490C15600,490,15360,490,15120,490C14880,490,14640,490,14400,490C14160,490,13920,490,13680,490C13440,490,13200,490,12960,490C12720,490,12480,490,12240,490C12000,490,11760,490,11520,490C11280,490,11040,490,10800,490C10560,490,10320,490,10080,490C9840,490,9600,490,9360,490C9120,490,8880,490,8640,490C8400,490,8160,490,7920,490C7680,490,7440,490,7200,490C6960,490,6720,490,6480,490C6240,490,6000,490,5760,490C5520,490,5280,490,5040,490C4800,490,4560,490,4320,490C4080,490,3840,490,3600,490C3360,490,3120,490,2880,490C2640,490,2400,490,2160,490C1920,490,1680,490,1440,490C1200,490,960,490,720,490C480,490,240,490,120,490L0,490Z"
                    ></path>
                </svg>{" "}
            </div>
            <div className="absolute block lg:hidden opacity-90 w-screen bottom-0">
                <img src={wave} alt="" />
            </div>
        </div>
    );
}

export default Home;
