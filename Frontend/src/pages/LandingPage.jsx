import React from 'react';
import { Community } from '../components/Community';
import { StatsSection } from '../components/StatsSection';
import { HeroSection } from '../components/features/landing/HeroSection';

export function LandingPage() {
    return (
        <>
            <HeroSection />
            <Community />
            <StatsSection />
        </>
    )
}
