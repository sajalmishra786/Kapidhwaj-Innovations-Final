import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { HERO_BUBBLES, HERO_CARDS, type HeroCardId } from '@/data/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { FanPhase } from './fanChoreography';
import { cardPose, useFanLayout, type FanLayout } from './fanLayout';
import { FanCard, type BubblePin } from './FanCard';
import { ENTRANCE_MS, FAN_START } from './heroMotion';
import { usePointerTilt } from './usePointerTilt';

const STAGE_PERSPECTIVE = 1100;
/** How far a lifted card shoves its neighbours aside, as a share of card width. */
const NUDGE_RATIO = 0.07;
/** Narrowest span between the two bubbles' anchors that fits both side by side. */
const TWO_BUBBLES_MIN_SPAN = 300;

/**
 * The second bubble hangs off the right of the last card; the first off the left
 * of the 2nd card (the 1st on compact screens, to buy the pair more room). When
 * even that leaves them too close together, the first is dropped.
 */
function bubbleFor(index: number, lastIndex: number, layout: FanLayout): BubblePin | null {
  if (index === lastIndex) return { bubble: HERO_BUBBLES[1], side: 'right' };

  const firstIndex = layout.isCompact ? 0 : 1;
  const span = layout.fanW - firstIndex * layout.pitch;
  if (index === firstIndex && span >= TWO_BUBBLES_MIN_SPAN) {
    return { bubble: HERO_BUBBLES[0], side: 'left' };
  }
  return null;
}

/**
 * The hero's signature piece: a row of poster cards in an arch.
 *
 * On load the front card is thrown in from below the screen — tilted, then
 * straightening as it lands on top of the rest of the stack — and the cards
 * beneath peel out from under it into the fan. Afterwards a hovered (or, on
 * touch, tapped) card lifts and its neighbours part around it, the fan tilts
 * slightly toward the pointer, and the cards drift almost imperceptibly. Nothing
 * here is tied to scroll position.
 *
 * It claims only the height left over once the headline and buttons are placed,
 * and sizes its cards to fit — so it never pushes them off a short screen.
 *
 * Decorative, so hidden from assistive tech; the buttons below carry the intent.
 */
export function CardFan() {
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const measured = useFanLayout(boxRef);
  const isVisible = useInView(boxRef);
  const [hoveredId, setHoveredId] = useState<HeroCardId | null>(null);
  const [pinnedId, setPinnedId] = useState<HeroCardId | null>(null);
  const [phase, setPhase] = useState<FanPhase>(reduced ? 'settled' : 'flight');
  const { rotateX, rotateY } = usePointerTilt(!reduced && isVisible);

  // The clock starts when the cards first mount, which is when their flight begins.
  const hasCards = measured !== null;
  useEffect(() => {
    if (reduced) {
      setPhase('settled');
      return;
    }
    if (!hasCards) return;

    const toFan = window.setTimeout(() => setPhase('fan'), FAN_START * 1000);
    const toSettled = window.setTimeout(() => setPhase('settled'), ENTRANCE_MS);
    return () => {
      window.clearTimeout(toFan);
      window.clearTimeout(toSettled);
    };
  }, [reduced, hasCards]);

  // A tapped card stays lifted until another is tapped or the user taps away.
  useEffect(() => {
    if (!pinnedId) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setPinnedId(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pinnedId]);

  const handleHover = useCallback((id: HeroCardId, isHovering: boolean) => {
    setHoveredId((current) => (isHovering ? id : current === id ? null : current));
  }, []);

  const handleTap = useCallback((id: HeroCardId, event: MouseEvent | TouchEvent | PointerEvent) => {
    // Mouse users already get hover; tap-to-focus is for touch and pen.
    if ('pointerType' in event && event.pointerType === 'mouse') return;
    setPinnedId((current) => (current === id ? null : id));
  }, []);

  // Nothing responds to the pointer until the cards have landed.
  const focusedId = phase === 'settled' ? (hoveredId ?? pinnedId) : null;
  const layout = measured?.layout ?? null;

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="flex min-h-[11rem] w-full flex-1 items-center"
      style={{ maxHeight: layout?.naturalStageH }}
    >
      {measured && layout && (
        <motion.div
          style={{
            height: layout.stageH,
            rotateX,
            rotateY,
            transformPerspective: STAGE_PERSPECTIVE,
          }}
          className="relative w-full"
        >
          {/* Contact shadow: grounds the arch so it reads as resting on a surface. */}
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: FAN_START + 0.3 }}
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] bg-ink-950/20 blur-2xl"
            style={{ width: layout.fanW * 0.82, height: layout.cardH * 0.14 }}
          />

          <Cards
            layout={layout}
            flightY={measured.flightY}
            phase={phase}
            focusedId={focusedId}
            isIdle={!reduced && phase === 'settled' && isVisible && focusedId === null}
            reduced={reduced}
            onHover={handleHover}
            onTap={handleTap}
          />
        </motion.div>
      )}
    </div>
  );
}

interface CardsProps {
  layout: FanLayout;
  flightY: number;
  phase: FanPhase;
  focusedId: HeroCardId | null;
  isIdle: boolean;
  reduced: boolean;
  onHover: (id: HeroCardId, isHovering: boolean) => void;
  onTap: (id: HeroCardId, event: MouseEvent | TouchEvent | PointerEvent) => void;
}

function Cards({ layout, flightY, phase, focusedId, isIdle, reduced, onHover, onTap }: CardsProps) {
  // Compact screens keep the *last* cards, so the strongest one stays on top.
  const cards = HERO_CARDS.slice(-layout.count);
  const lastIndex = cards.length - 1;
  const focusedIndex = cards.findIndex((card) => card.id === focusedId);

  return (
    <>
      {cards.map((card, index) => {
        const distance = index - focusedIndex;
        const nudgeX =
          reduced || focusedIndex < 0 || distance === 0
            ? 0
            : (Math.sign(distance) * layout.cardW * NUDGE_RATIO) / Math.abs(distance);

        return (
          <FanCard
            key={card.id}
            card={card}
            index={index}
            layout={layout}
            pose={cardPose(index, layout)}
            phase={phase}
            flightY={flightY}
            isFront={index === lastIndex}
            nudgeX={nudgeX}
            zIndex={card.id === focusedId ? cards.length + 1 : index}
            isFocused={card.id === focusedId}
            isIdle={isIdle}
            showText={!layout.isCompact || index === lastIndex}
            reduced={reduced}
            pin={bubbleFor(index, lastIndex, layout)}
            onHover={onHover}
            onTap={onTap}
          />
        );
      })}
    </>
  );
}
