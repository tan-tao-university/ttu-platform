import Hero from '@/components/landing/Hero';
import IntroSection from '@/components/landing/IntroSection';
import StatsRow from '@/components/landing/StatsRow';
import WhyTtuSection from '@/components/landing/WhyTtuSection';
import ProgramsSection from '@/components/landing/ProgramsSection';
import ScholarshipSection from '@/components/landing/ScholarshipSection';
import AdmissionMethodsSection from '@/components/landing/AdmissionMethodsSection';
import GlobalNetworkSection from '@/components/landing/GlobalNetworkSection';
import AnnouncementsSection from '@/components/landing/AnnouncementsSection';
import NewsEventsSection from '@/components/landing/NewsEventsSection';
import AdmissionFormSection from '@/components/landing/AdmissionFormSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroSection />
      <StatsRow />
      <WhyTtuSection />
      <ProgramsSection />
      <ScholarshipSection />
      <AdmissionMethodsSection />
      <GlobalNetworkSection />
      <AnnouncementsSection />
      <NewsEventsSection />
      <AdmissionFormSection />
    </>
  );
}
