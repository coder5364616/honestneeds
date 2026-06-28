'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import FeaturedCampaign from '@/components/sections/FeaturedCampaign';
import CampaignFeed from '@/components/sections/CampaignFeed';
import BannerSection from '@/components/sections/BannerSection';
import BrowseByNeedType from '@/components/sections/BrowseByNeedType';
import FourWaysHelp from '@/components/sections/FourWaysHelp';
import HowPaymentsWork from '@/components/sections/HowPaymentsWork';
import ShareRewards from '@/components/sections/ShareRewards';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import BecomeSponsor from '@/components/sections/BecomeSponsor';
import SupportMission from '@/components/sections/SupportMission';
import Footer from '@/components/sections/Footer';
import DeferSection from '@/components/DeferSection';

// Header is interactive-only; keep it client-only.
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Above the fold — render normally. */}
        <Hero />

        {/* Below the fold — server-rendered (so the page is scrollable immediately)
            but their off-screen rendering/animation work is skipped by the browser
            via content-visibility, which is what keeps scrolling smooth. */}
        <DeferSection $minHeight={600}><HowItWorks /></DeferSection>
        <DeferSection $minHeight={700}><FeaturedCampaign /></DeferSection>
        <DeferSection $minHeight={800}><CampaignFeed /></DeferSection>
        <DeferSection $minHeight={400}><BannerSection /></DeferSection>
        <DeferSection $minHeight={500}><BrowseByNeedType /></DeferSection>
        <DeferSection $minHeight={600}><FourWaysHelp /></DeferSection>
        <DeferSection $minHeight={600}><HowPaymentsWork /></DeferSection>
        <DeferSection $minHeight={600}><ShareRewards /></DeferSection>
        <DeferSection $minHeight={600}><Testimonials /></DeferSection>
        <DeferSection $minHeight={600}><Pricing /></DeferSection>
        <DeferSection $minHeight={500}><BecomeSponsor /></DeferSection>
        <DeferSection $minHeight={500}><SupportMission /></DeferSection>
      </main>
      <DeferSection $minHeight={400}><Footer /></DeferSection>
    </>
  );
}
