'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import TrustStrip from '@/components/sections/TrustStrip';
import HowItWorks from '@/components/sections/HowItWorks';
import FeaturedCampaign from '@/components/sections/FeaturedCampaign';
import CampaignFeed from '@/components/sections/CampaignFeed';
import BrowseByNeedType from '@/components/sections/BrowseByNeedType';
import FourWaysHelp from '@/components/sections/FourWaysHelp';
import HowPaymentsWork from '@/components/sections/HowPaymentsWork';
import ShareRewards from '@/components/sections/ShareRewards';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import BecomeSponsor from '@/components/sections/BecomeSponsor';
import SupportMission from '@/components/sections/SupportMission';
import Footer from '@/components/sections/Footer';

const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <FeaturedCampaign />
        <CampaignFeed />
        <BrowseByNeedType />
        <FourWaysHelp />
        <HowPaymentsWork />
        <ShareRewards />
        <Testimonials />
        <Pricing />
        <BecomeSponsor />
        <SupportMission />
      </main>
      <Footer />
    </>
  );
}

