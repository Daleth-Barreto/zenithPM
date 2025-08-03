
'use client';

import Joyride, { type Step } from 'react-joyride';
import { useTheme } from 'next-themes';

interface AppTourProps {
  isTourOpen: boolean;
  onTourComplete: () => void;
}

export function AppTour({ isTourOpen, onTourComplete }: AppTourProps) {
  const { theme } = useTheme();

  const steps: Step[] = [
    {
      target: '[data-tour="dashboard-title"]',
      content: '¡Bienvenido a ZenithPM! Este es tu portafolio de proyectos, donde puedes ver todo de un vistazo.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="new-project-btn"]',
      content: 'Puedes crear tu primer proyecto haciendo clic aquí.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="sidebar-projects"]',
      content: 'Tus proyectos aparecerán aquí para un acceso rápido.',
      placement: 'right',
    },
    {
      target: '[data-tour="user-menu"]',
      content: 'Y este es tu menú de usuario, donde puedes editar tu perfil y cerrar sesión.',
      placement: 'bottom-end',
    },
  ];

  return (
    <Joyride
      run={isTourOpen}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      callback={(data) => {
        if (['finished', 'skipped'].includes(data.status)) {
          onTourComplete();
        }
      }}
      styles={{
        options: {
          arrowColor: theme === 'dark' ? '#1c1c1c' : '#ffffff',
          backgroundColor: theme === 'dark' ? '#1c1c1c' : '#ffffff',
          primaryColor: '#58b3b3',
          textColor: theme === 'dark' ? '#ffffff' : '#000000',
          zIndex: 1000,
        },
      }}
    />
  );
}
