import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button';

export function HeroSection() {
    return (
        <div className="relative w-full h-screen overflow-hidden text-white font-sans mt-4">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-no-repeat z-0 transition-transfo duration1000 "
                style={{ backgroundImage: "url('/images/mainimg/hero3.png')" }}
            >
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/10 to-black/10 "></div> */}
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center sm:px-6 lg:px-8">

                {/* Text Content */}
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                    <h1 className="text-5xl font-extrabold tracking sm:text-6xl md:text-4xl drop-shadow-lg">
                        <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
                            Create. Design. Inspire.
                        </span>
                        <span className="block mt-2 ">
                            Elevate Your{" "}
                            <span className='text-linear-to-r from-blue-400 via-purple-400 to-pink-400'>
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
                        <Link to="/signup">
                            <Button
                                variant="gradient"
                                size="xl"
                                className="rounded-full shadow-lg"
                            >
                                Get Started For Free
                            </Button>
                        </Link>

                        <Link to="/login">
                            <Button
                                variant="secondary"
                                size="xl"
                                className="rounded-full shadow-lg bg-white/10 backdrop-blur-md border border-black/20 text-black hover:bg-white/20"
                            >
                                Log In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
