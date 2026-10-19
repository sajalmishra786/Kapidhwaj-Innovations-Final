import type { IconType } from 'react-icons';
import { FiCompass, FiPenTool, FiCode, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export interface StepperItem {
  id: string;
  title: string;
  description: string;
  deliverable?: string;
  icon: IconType;
}

export const STEPPER_CONTENT: StepperItem[] = [
  {
    id: '01',
    title: 'Discover & Define',
    description:
      'We begin by understanding your business objectives, challenges, users, and expectations. Together, we establish the problem to solve, define the scope, and identify the requirements that matter most.',
    icon: FiCompass,
  },
  {
    id: '02',
    title: 'Strategize & Design',
    description:
      'We translate requirements into a solution blueprint, defining the architecture, user experience, technology approach, milestones, and implementation priorities before development begins.',
    icon: FiPenTool,
  },
  {
    id: '03',
    title: 'Engineer & Build',
    description:
      'We develop the solution in structured stages, translating the approved plan into functional software. Regular progress reviews and milestone discussions help maintain alignment throughout implementation.',
    deliverable: 'Working features and iterative product builds.',
    icon: FiCode,
  },
  {
    id: '04',
    title: 'Validate & Deploy',
    description:
      'We test functionality, review performance, address identified issues, and prepare the solution for deployment. The release process is planned around agreed acceptance criteria and operational requirements.',
    icon: FiCheckCircle,
  },
  {
    id: '05',
    title: 'Support & Evolve',
    description:
      'After launch, we help address agreed support needs, monitor relevant issues where contracted, and identify improvements as your business and technical requirements evolve.',
    icon: FiTrendingUp,
  },
];
