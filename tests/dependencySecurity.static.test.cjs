const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/dependency-security.yml'), 'utf8');
const dependabot = fs.readFileSync(path.join(root, '.github/dependabot.yml'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;

test('security audit runs on PR, main pushes, weekly schedule and manual dispatch', () => {
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /branches:\s*\[main, master\]/);
  assert.match(workflow, /cron:/);
  assert.match(workflow, /workflow_dispatch:/);
});

test('security workflow requires a committed lockfile and uses npm ci', () => {
  assert.match(workflow, /check:reproducible-install/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
});

test('security workflow fails on high or critical npm advisories', () => {
  assert.match(workflow, /npm audit --audit-level=high/);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
});

test('Dependabot checks npm packages and GitHub Actions weekly', () => {
  assert.match(dependabot, /package-ecosystem: npm/);
  assert.match(dependabot, /package-ecosystem: github-actions/);
  assert.equal((dependabot.match(/interval: weekly/g) || []).length, 2);
});

test('package and Expo app versions are aligned at 1.0.42', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.version, pkg.version);
});
