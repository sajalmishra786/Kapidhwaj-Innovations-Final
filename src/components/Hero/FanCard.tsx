import { motion, type Transition } from 'framer-motion';
import type { HeroBubble, HeroCard, HeroCardId } from '@/data/content';
import {
  CARD_PERSPECTIVE,
  flightStart,
  slotTarget,
  slotTransition,
  type FanPhase,
} from './fanChoreography';
import { BUBBLE_ROOM, type CardPose, type FanLayout } from './fanLayout';
import { FAN_START, LIFT_SPRING } from './heroMotion';
import { TagBubble } from './TagBubble';
import { WorkCard } from './WorkCard';

const LIFT_PX = 18;
const LIFT_SCALE = 1.05;
/** Share of a card's lean that is undone while it is lifted. */
const STRAIGHTEN = 0.6;
const FLOAT_PX = 3;
const FLOAT_BASE_SECONDS = 5.2;

export interface BubblePin {
  bubble: HeroBubble;
  side: 'left' | 'right';
}

interface FanCardProps {
  card: HeroCard;
  index: number;
  layout: FanLayout;
  pose: CardPose;
  phase: FanPhase;
  /** How far below its resting place the entrance starts. */
  flightY: number;
  /** The front card is the one that flies in; the rest wait behind it. */
  isFront: boolean;
  /** Sideways shove from a lifted neighbour, in px. */
  nudgeX: number;
  zIndex: number;
  isFocused: boolean;
  isIdle: boolean;
  showText: boolean;
  reduced: boolean;
  pin: BubblePin | null;
  onHover: (id: HeroCardId, isHovering: boolean) => void;
  onTap: (id: HeroCardId, event: MouseEvent | TouchEvent | PointerEvent) => void;
}

/**
 * One card in the fan, built from three nested layers so each motion has a
 * single job:
 *
 * 1. **slot** — the entrance (flight, then fan) and the resting pose. Also the
 *    hit area: it never lifts, so a card can't rise out from under a stationary
 *    cursor and flicker between hovered and not.
 * 2. **lift** — hover / tap response.
 * 3. **float** — a barely-there idle drift, off while the card is focused.
 */
export function FanCard({
  card,
  index,
  layout,
  pose,
  phase,
  flightY,
  isFront,
  nudgeX,
  zIndex,
  isFocused,
  isIdle,
  showText,
  reduced,
  pin,
  onHover,
  onTap,
}: FanCardProps) {
  const lift =
    isFocused && !reduced
      ? { y: -LIFT_PX, scale: LIFT_SCALE, rotate: -pose.rotate * STRAIGHTEN }
      : { y: 0, scale: 1, rotate: 0 };

  const floatTransition: Transition = {
    duration: FLOAT_BASE_SECONDS + (index % 3) * 0.9,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: index * 0.35,
  };

  // Behind the front card, shadows would pile up while the stack is still one
  // pile (see WorkCard), so they fade in as the stack opens.
  const shadowDelay = reduced || isFront ? 0 : FAN_START;

  return (
    <motion.div
      data-fan-card={card.id}
      initial={reduced ? false : flightStart(flightY, isFront)}
      animate={slotTarget(reduced ? 'settled' : phase, pose, nudgeX, isFront)}
      transition={reduced ? { duration: 0 } : slotTransition(phase)}
      onHoverStart={() => onHover(card.id, true)}
      onHoverEnd={() => onHover(card.id, false)}
      onTap={(event) => onTap(card.id, event)}
      className="absolute left-1/2"
      style={{
        top: BUBBLE_ROOM,
        width: layout.cardW,
        height: layout.cardH,
        marginLeft: -layout.cardW / 2,
        zIndex,
        transformPerspective: CARD_PERSPECTIVE,
      }}
    >
      <motion.div animate={lift} transition={LIFT_SPRING} className="h-full w-full will-change-transform">
        <motion.div
          animate={{ y: isIdle ? [0, -FLOAT_PX, 0] : 0 }}
          transition={isIdle ? floatTransition : LIFT_SPRING}
          className="h-full w-full"
        >
          <WorkCard card={card} width={layout.cardW} showText={showText} shadowDelay={shadowDelay} />
          {pin && <TagBubble {...pin.bubble} side={pin.side} />}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
