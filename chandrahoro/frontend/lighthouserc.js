module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/chart/sample'
      ],
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        },
        formFactor: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    assert: {
      assertions: {
        // Performance assertions (target >90)
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxLength: 10 }],
        'unused-javascript': ['warn', { maxLength: 10 }],
        'render-blocking-resources': ['warn', { maxLength: 5 }],
        'unminified-css': ['error', { maxLength: 0 }],
        'unminified-javascript': ['error', { maxLength: 0 }],
        
        // Image optimization
        'modern-image-formats': ['warn', { maxLength: 5 }],
        'uses-optimized-images': ['warn', { maxLength: 5 }],
        'uses-responsive-images': ['warn', { maxLength: 5 }],
        
        // Caching
        'uses-long-cache-ttl': ['warn', { maxLength: 10 }],
        
        // Accessibility
        'color-contrast': ['error', { maxLength: 0 }],
        'image-alt': ['error', { maxLength: 0 }],
        'label': ['error', { maxLength: 0 }],
        'link-name': ['error', { maxLength: 0 }],
        
        // Best practices
        'uses-https': ['error', { maxLength: 0 }],
        'is-on-https': ['error', { maxLength: 0 }],
        'no-vulnerable-libraries': ['warn', { maxLength: 5 }],
        
        // SEO
        'meta-description': ['error', { maxLength: 0 }],
        'document-title': ['error', { maxLength: 0 }],
        'html-has-lang': ['error', { maxLength: 0 }],
        'meta-viewport': ['error', { maxLength: 0 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './lighthouse-reports'
      }
    }
  }
};
