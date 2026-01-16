import React from 'react';
import { Community } from '../components/Community';
import AnimationCounter from '../components/AnimationCounter';

export function LandingPage() {
    return (
        <>
            <div className="relative w-full h-screen overflow-hidden text-white font-sans mt-4">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-no-repeat z-0 transition-transfo duration1000 "
                    style={{ backgroundImage: "url('/images/mainimg/hero1.png')" }}
                >
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/10 to-black/10 "></div> */}
                </div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center sm:px-6 lg:px-8">

                    {/* Text Content */}
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                        <h1 className="text-5xl font-extrabold tracking sm:text-6xl md:text-4xl drop-shadow-lg">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                Create. Design. Inspire.
                            </span>
                            <span className="block mt-2 ">
                                Elevate Your{" "}
                                <span className='text-gradient-to-r from-blue-400 via-purple-400 to-pink-400'>
                                    Digital
                                </span>
                                {" "}
                                Presence
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg text-black sm:text-x l md:text-xl font-light leading-relaxed drop-shadow-md">
                            Unleash your creativity with our powerful tools.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                            <button className="px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-cyan-500/50 hover:scale-105 hover:from-blue-500 hover:to-purple-500 focus:outline-none ring-2 ring-purple-400/50 cursor-pointer">
                                Get Started For Free
                            </button>

                            <button className="px-8 py-4 text-lg font-semibold text-black transition-all duration-300 bg-white/10 backdrop-blur-md border border-black/20 rounded-full shadow-lg hover:bg-white/20 hover:scale-105 focus:outline-none cursor-pointer">
                                Log In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Community />
            <AnimationCounter />
        </>
    )
}
