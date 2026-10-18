import { loadConfig } from './config';

describe('loadConfig', () => {
  it('falls back to development defaults outside production', () => {
    const cfg = loadConfig({ NODE_ENV: 'development' });
    expect(cfg.databaseUrl).toContain('localhost');
    expect(cfg.port).toBe(3001);
  });

  it('refuses to start in production without a database', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/DATABASE_URL/);
  });

  it('accepts a complete production configuration', () => {
    const cfg = loadConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://u:p@h/db' });
    expect(cfg.isProd).toBe(true);
  });
});
