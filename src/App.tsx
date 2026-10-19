import { Suspense, lazy } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { Navbar } from '@/components/Navbar/Navbar';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Hero } from '@/components/Hero/Hero';
import { InfiniteScroll } from '@/components/InfiniteScroll/InfiniteScroll';

// Below-the-fold sections are code-split to keep the hero critical path lean.
const UnicornTeam = lazy(() =>
  import('@/components/UnicornTeam/UnicornTeam').then((m) => ({
    default: m.UnicornTeam,
  })),
);
const StackCards = lazy(() =>
  import('@/components/StackCards/StackCards').then((m) => ({ default: m.StackCards })),
);
const SaaSDesignStepper = lazy(() =>
  import('@/components/SaaSDesignStepper/SaaSDesignStepper').then((m) => ({ default: m.SaaSDesignStepper })),
);
const NightRise = lazy(() =>
  import('@/components/NightRise/NightRise').then((m) => ({ default: m.NightRise })),
);
const CircleScroll = lazy(() =>
  import('@/components/CircleScroll/CircleScroll').then((m) => ({ default: m.CircleScroll })),
);
// const WaveGallery = lazy(() =>
//   import('@/components/WaveGallery/WaveGallery').then((m) => ({ default: m.WaveGallery })),
// );
const FAQ = lazy(() => import('@/components/FAQ/FAQ').then((m) => ({ default: m.FAQ })));
const Contact = lazy(() =>
  import('@/components/Contact/Contact').then((m) => ({ default: m.Contact })),
);
const Footer = lazy(() =>
  import('@/components/Footer/Footer').then((m) => ({ default: m.Footer })),
);

/** Lightweight placeholder so lazy chunks never shift layout abruptly. */
function SectionFallback() {
  return <div className="min-h-[60svh]" aria-hidden />;
}

export default function App() {
  useLenis();

  return (
    <>
      <Navbar />

      <main>
        <SectionWrapper id="hero" label="Introduction" padded={false}>
          <Hero />
        </SectionWrapper>

        <SectionWrapper id="capabilities" label="Capabilities" padded={false}>
          <InfiniteScroll />
        </SectionWrapper>

        <Suspense fallback={<SectionFallback />}>
          <SectionWrapper id="unicorn-team" label="Unicorn Team" padded={false}>
            <UnicornTeam />
          </SectionWrapper>

          <SectionWrapper id="stack" label="Services" padded={false}>
            <StackCards />
          </SectionWrapper>
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionWrapper id="saas-design" label="Development Process" padded={false} className="z-10">
            <SaaSDesignStepper />
          </SectionWrapper>
        </Suspense>

        {/* Light → dark hand-off: a hard line rises off the cream page and opens
            into the dome that the rest of the page sits on. */}
        <Suspense fallback={<SectionFallback />}>
          <SectionWrapper id="why-choose-us" label="Why Choose Us" padded={false}>
            <NightRise />
          </SectionWrapper>
        </Suspense>

        {/* The dark chapter — from here to the footer. `night-chapter` re-points the
            shared tokens (glass, eyebrow, gradient text) for the dark surface. */}
        <div className="night-chapter bg-night">
          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper id="loop" label="Why Choose Us" padded={false}>
              <CircleScroll />
            </SectionWrapper>
          </Suspense>

          {/* WaveGallery ("Selected work") hidden */}

          <Suspense fallback={<SectionFallback />}>
            <SectionWrapper id="faq" label="Frequently asked questions" className="pb-12 sm:pb-16">
              <FAQ />
            </SectionWrapper>

            <SectionWrapper id="contact" label="Contact us" className="pt-12 pb-12 sm:pt-16 sm:pb-16">
              <Contact />
            </SectionWrapper>
          </Suspense>
        </div>
      </main>

      {/* Outside <main>, so it is the page's `contentinfo` landmark. */}
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
    </>
  );
}
