import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, inView, stagger } from '@/animations/motionVariants';
import { STUDIO_LINKS } from '@/data/footer';
import { CONTACT_EMAIL } from '@/data/site';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { COLUMN_HEADING, FOCUS_RING, FooterColumn } from './FooterColumn';
import { FooterWordmark } from './FooterWordmark';
import { SectionLink } from './SectionLink';
import { SocialLinks } from './SocialLinks';
import { useSheetScale } from './useSheetScale';

const [EMAIL_LOCAL, EMAIL_DOMAIN] = CONTACT_EMAIL.split('@');

/**
 * The footer is one screen frame, on every screen: it is at least a full viewport tall, the
 * link grid sits at the top of the sheet and the wordmark is pushed to the bottom. Gaps and
 * the wordmark are sized from the viewport height (`svh`) so the whole thing still fits when
 * the screen is short; only a very short one (a phone in landscape) spills past one frame.
 */
export function Footer() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const scale = useSheetScale(sheetRef);
  const reduced = useReducedMotion();

  return (
    // `bg-night` is the Contact section's own surface, so the ground above the sheet is
    // simply the page continuing; the light sheet rises out of it.
    <footer className="relative flex min-h-svh flex-col bg-night">
      <div className="flex flex-1 flex-col pt-[clamp(1.25rem,4svh,6rem)]">
        <motion.div
          ref={sheetRef}
          style={{ scale }}
          className="relative flex flex-1 origin-top flex-col overflow-hidden rounded-t-[clamp(1.75rem,5vw,5rem)] bg-cream-50 text-ink-900 will-change-transform"
        >
          <div className="mx-auto w-full max-w-6xl px-6 pt-[clamp(1.25rem,4.5svh,7rem)]">
            <motion.div
              variants={stagger(0.08)}
              initial={reduced ? false : 'hidden'}
              whileInView="visible"
              viewport={inView}
              className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 md:grid-cols-[1.4fr_0.8fr_1.2fr] lg:grid-cols-[1.6fr_0.8fr_1.2fr] gap-x-8 md:gap-y-12"
            >
              {/* brand */}
              <motion.div variants={fadeUp} className="col-span-1 sm:col-span-2 md:col-span-1 md:max-w-xs">
                {/* On phones the social icons ride beside the name, which keeps the whole
                    footer inside one frame; from `md` they move down to the contact column. */}
                <div className="flex items-center justify-between gap-4">
                  <SectionLink
                    sectionId="hero"
                    className={`font-display text-3xl font-semibold text-ink-900 sm:text-2xl ${FOCUS_RING}`}
                  >
                    Kapidhwaj Innovations
                  </SectionLink>
                  <SocialLinks className="md:hidden" />
                </div>
                <p className="mt-3 text-sm leading-snug text-ink-900/65 sm:mt-4 sm:leading-relaxed">
                  Where business vision meets technical execution.
                </p>
              </motion.div>

              <FooterColumn title="Studio" links={STUDIO_LINKS} />

              {/* contact + socials */}
              <motion.div variants={fadeUp} className="col-span-1 sm:col-span-1 md:col-span-1">
                <h2 className={COLUMN_HEADING}>Get in touch</h2>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className={`group text-[0.9375rem] leading-snug text-ink-900/80 transition-colors duration-300 hover:text-ink-950 sm:text-sm ${FOCUS_RING}`}
                >
                  {/* Only break after the @, never mid-word, if the column gets tight. The
                      arrow is inline so it stays with the last line instead of drifting off. */}
                  {EMAIL_LOCAL}@<wbr />
                  {EMAIL_DOMAIN}
                  <FiArrowUpRight
                    aria-hidden
                    className="ml-1.5 inline-block align-[-0.1em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>

                <div className="hidden md:block">
                  <h2 className={`${COLUMN_HEADING} mt-[clamp(1rem,3.5svh,2.25rem)]`}>Follow</h2>
                  <SocialLinks />
                </div>
              </motion.div>
            </motion.div>

          </div>

          {/* The copyright rides just above the wordmark; any spare height in the frame
              opens up between the links and this pair. */}
          <div className="mx-auto mt-auto w-full max-w-6xl px-6 pt-[clamp(1rem,3svh,3rem)]">
            <p className="text-[0.8125rem] leading-relaxed text-ink-900/65 sm:text-xs">
              © {new Date().getFullYear()} Kapidhwaj Innovations Pvt. Ltd. All rights reserved.
            </p>
          </div>

          <FooterWordmark />
        </motion.div>
      </div>
    </footer>
  );
}
