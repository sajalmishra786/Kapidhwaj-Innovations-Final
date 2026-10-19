import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAQ_ITEMS } from '@/data/content';
import { spring } from '@/animations/motionVariants';

/**
 * Accordion FAQ — allows multiple items open at a time. Height animates via
 * Framer's auto-height (grid-rows trick avoids layout-property animation
 * jank); the toggle icon rotates. Built on native button + aria-expanded.
 */
export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-6">
      <SectionHeading
        eyebrow="Questions"
        title="Everything you might ask."
        tone="dark"
      />

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => setOpenItems([])}
          disabled={openItems.length === 0}
          className={`text-sm font-medium transition-all ${
            openItems.length > 0
              ? 'text-cream-100/60 hover:text-cream-100 opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={openItems.length === 0}
        >
          Close all
        </button>
      </div>

      <div className="mt-2 space-y-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openItems.includes(i);
          return (
            <div key={item.question} className="glass overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => toggleItem(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left outline-none ring-accent-coral/70 focus-visible:ring-2"
              >
                <span className="font-display text-base font-medium text-cream-100 sm:text-lg">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={spring}
                  className="shrink-0 text-accent-coral"
                >
                  <FiPlus className="text-xl" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 pt-0 text-cream-100/60">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
