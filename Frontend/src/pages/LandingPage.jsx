import React from 'react';
import { Community } from '../components/Community';
import AnimationCounter from '../components/AnimationCounter';
import { HeroSection } from '../components/features/landing/HeroSection';

export function LandingPage() {
    return (
        <>
            <HeroSection />
            <Community />
            <AnimationCounter />
        </>
    )
}
