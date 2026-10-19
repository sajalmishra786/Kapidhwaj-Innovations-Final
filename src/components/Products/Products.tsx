import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PRODUCTS } from '@/data/content';
import { stagger, inView } from '@/animations/motionVariants';

/** Premium 2x2 product showcase with tilt cards. */
export function Products() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <SectionHeading
        eyebrow="What we do"
        title="Four ways we build your SaaS."
        description="From first sketch to scaled platform — the four pillars behind every Kapidhwaj product."
      />

      <motion.div
        variants={stagger(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12"
      >
        {PRODUCTS.map((product) => (
          <ProductCard key={product.title} product={product} />
        ))}
      </motion.div>
    </div>
  );
}
