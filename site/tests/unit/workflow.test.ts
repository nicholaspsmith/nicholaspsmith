import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('../.github/workflows/deploy.yaml', 'utf8');

describe('deploy workflow', () => {
  it('builds explicitly, with the analytics token, right before deploying', () => {
    const build = workflow.indexOf('run: npm run build');
    expect(build).toBeGreaterThan(workflow.indexOf('run: npm run test:e2e'));
    expect(build).toBeLessThan(workflow.indexOf('cloudflare/wrangler-action'));
    expect(workflow).toContain('PUBLIC_CF_BEACON: ${{ vars.PUBLIC_CF_BEACON }}');
  });

  it('checks the words and budget against that same final build', () => {
    expect(workflow.indexOf('run: npm run check:vocabulary')).toBeGreaterThan(workflow.indexOf('run: npm run build'));
  });
});
