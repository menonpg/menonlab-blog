#!/usr/bin/env node
/**
 * Accessibility Check
 * Uses pa11y to check WCAG 2.1 AA compliance on key pages
 * Run this before deploying to catch accessibility issues
 */

import pa11y from 'pa11y';

const BASE_URL = process.env.PREVIEW_URL || 'http://localhost:4321';

// Pages to test
const PAGES = [
  '/',
  '/about',
  '/blog',
  '/docs',
];

async function checkPage(url) {
  try {
    const results = await pa11y(url, {
      standard: 'WCAG2AA',
      timeout: 30000,
      chromeLaunchConfig: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    return {
      url,
      passed: results.issues.length === 0,
      errorCount: results.issues.filter(i => i.type === 'error').length,
      warningCount: results.issues.filter(i => i.type === 'warning').length,
      issues: results.issues,
    };
  } catch (error) {
    console.error(`Error checking ${url}:`, error.message);
    return {
      url,
      passed: false,
      errorCount: 1,
      warningCount: 0,
      issues: [{ type: 'error', message: error.message }],
    };
  }
}

async function checkAccessibility() {
  console.log('\n♿ Accessibility Check (WCAG 2.1 AA)\n');
  console.log(`Testing against: ${BASE_URL}\n`);

  const results = [];
  
  for (const page of PAGES) {
    const url = `${BASE_URL}${page}`;
    process.stdout.write(`Checking ${page}... `);
    
    const result = await checkPage(url);
    results.push(result);
    
    if (result.passed) {
      console.log('✅ Passed');
    } else {
      console.log(`❌ ${result.errorCount} errors, ${result.warningCount} warnings`);
    }
  }

  console.log('\n📋 Summary:\n');

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    totalErrors += result.errorCount;
    totalWarnings += result.warningCount;

    if (result.errorCount > 0) {
      console.log(`\n❌ ${result.url}:`);
      result.issues
        .filter(i => i.type === 'error')
        .slice(0, 5) // Show first 5 errors
        .forEach(issue => {
          console.log(`  • ${issue.message}`);
          if (issue.selector) {
            console.log(`    Selector: ${issue.selector}`);
          }
        });
      
      if (result.errorCount > 5) {
        console.log(`  ... and ${result.errorCount - 5} more errors`);
      }
    }
  }

  console.log(`\nTotal: ${totalErrors} errors, ${totalWarnings} warnings\n`);

  if (totalErrors > 0) {
    console.error('❌ Accessibility check failed. Fix errors before deploying.\n');
    process.exit(1);
  }

  console.log('✅ All pages pass WCAG 2.1 AA compliance!\n');
}

checkAccessibility().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
