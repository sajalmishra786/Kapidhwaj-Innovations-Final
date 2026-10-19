import { SOCIALS } from '@/data/footer';
import { cn } from '@/lib/cn';
import { FOCUS_RING } from './FooterColumn';

interface SocialLinksProps {
  className?: string;
}

/** Round icon links to the studio's social profiles. */
export function SocialLinks({ className }: SocialLinksProps) {
  return (
    <ul aria-label="Social profiles" className={cn('flex gap-3', className)}>
      {SOCIALS.map(({ label, href, icon: Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-lg text-cream-50 transition-[transform,background-color] duration-300 ease-out-expo hover:-translate-y-1 hover:bg-accent-violet md:h-11 md:w-11 ${FOCUS_RING}`}
          >
            <Icon aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
