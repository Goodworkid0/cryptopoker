import { Header, Footer } from '@/components/layout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TablesPreview } from '@/components/home/TablesPreview';
import { TokenSection } from '@/components/home/TokenSection';
import { StatsSection } from '@/components/home/StatsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-poker flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TablesPreview />
        <TokenSection />
      </main>
      <Footer />
    </div>
  );
}
