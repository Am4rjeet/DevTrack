import { parseRecentCommits, mapRepos, mapProfile } from '../../../src/lib/githubApi.js';

describe('GitHub API helpers', () => {
  it('should parse PushEvents into recent commits', () => {
    const events = [
      {
        type: 'PushEvent',
        created_at: '2026-06-01T10:00:00Z',
        repo: { name: 'user/repo' },
        payload: {
          commits: [
            { message: 'feat: add auth', sha: 'abc123' },
            { message: 'fix: typo', sha: 'def456' },
          ],
        },
      },
      {
        type: 'WatchEvent',
        created_at: '2026-06-01T09:00:00Z',
      },
    ];

    const commits = parseRecentCommits(events, 5);

    expect(commits).toHaveLength(2);
    expect(commits[0].repo).toBe('user/repo');
    expect(commits[0].message).toBe('feat: add auth');
    expect(commits[0].url).toContain('abc123');
  });

  it('should map repository data', () => {
    const repos = mapRepos([
      {
        name: 'devtrack',
        stargazers_count: 10,
        language: 'JavaScript',
        html_url: 'https://github.com/u/devtrack',
        description: 'Tracker',
        updated_at: '2026-06-01T00:00:00Z',
      },
    ]);

    expect(repos[0].name).toBe('devtrack');
    expect(repos[0].stars).toBe(10);
  });

  it('should map profile data', () => {
    const profile = mapProfile({
      name: 'Dev User',
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      bio: 'Builder',
      location: 'India',
      company: '@startup',
      blog: 'https://dev.dev',
      html_url: 'https://github.com/devuser',
    });

    expect(profile.name).toBe('Dev User');
    expect(profile.htmlUrl).toContain('github.com');
  });
});
