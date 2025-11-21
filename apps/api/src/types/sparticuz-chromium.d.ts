declare module '@sparticuz/chromium' {
  import type { Viewport } from 'puppeteer-core';

  interface ChromiumExports {
    args?: string[];
    defaultViewport?: Viewport;
    headless?: boolean | 'shell';
    executablePath: (options?: { cacheDir?: string }) => Promise<string | undefined>;
  }

  const chromium: ChromiumExports;
  export default chromium;
}

