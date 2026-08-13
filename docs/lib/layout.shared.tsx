import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Hourglass } from 'lucide-react';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Hourglass className="size-4 text-fd-primary" />
          <span className="font-semibold">{appName}</span>
        </>
      ),
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Download',
        url: `https://github.com/${gitConfig.user}/${gitConfig.repo}/releases`,
        external: true,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
