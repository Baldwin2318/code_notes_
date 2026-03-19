import pg from 'pg';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import critical_data from '../../shared_data/server_critical_data.js';

const pool = new pg.Pool({
  connectionString: critical_data.NEON_DATABASE_URL || undefined,
  ssl: critical_data.NEON_DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 20
});

function getDbClient() {
  if (!critical_data.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL is missing. Add it before starting the server.');
  }

  return pool.connect();
}

function parseBoolean(value, fallback = false) {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function detectiOSApp(tree) {
  const paths = tree.map((item) => item.path || '');

  const indicators = {
    xcodeproj: paths.some((p) => p.endsWith('.xcodeproj')),
    xcworkspace: paths.some((p) => p.endsWith('.xcworkspace')),
    infoPlist: paths.some((p) => p.endsWith('Info.plist')),
    swiftFiles: paths.some((p) => p.endsWith('.swift')),
    xcassets: paths.some((p) => p.endsWith('.xcassets'))
  };

  const isiOS = indicators.xcodeproj || indicators.xcworkspace || indicators.infoPlist;

  return { isiOS, indicators };
}

function findAppIcon(tree) {
  const paths = tree.map((item) => item.path || '');

  const iconFile = paths.find((p) => (
    p.includes('AppIcon.appiconset') &&
    (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg'))
  ));

  return iconFile || null;
}

const CHAT_FALLBACK = 'I only answer questions about this portfolio.';
const CHAT_QUOTA_MESSAGE = 'Baldwin exceeded his Gemini quota for today. The chatbot is powered by Gemini, so please try again later.';

function compactText(value, maxLength = 500) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}...`;
}

function isGeminiQuotaExceeded(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('quota exceeded') ||
    message.includes('rate-limits') ||
    message.includes('generate_content_free_tier_requests') ||
    message.includes('resource_exhausted')
  );
}

function baldwin_web_router1(app) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (val) => val);
  pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (val) => val);


  const validAnnouncementComponents = new Set(['banner', 'overlay', 'ribbon']);

  function normalizeAnnouncementComponent(rawComponent) {
    const normalized = String(rawComponent || 'banner').trim().toLowerCase();
    return validAnnouncementComponents.has(normalized) ? normalized : null;
  }

  async function fetchAnnouncementConfig(client, component) {
    const [settingsResult, announcementResult, wipResult] = await Promise.all([
      client.query(
        `
          SELECT key, value
          FROM config.site_settings
          WHERE key IN ('banner_enabled', 'banner_message', 'github_url')
        `
      ),
      client.query(
        `
          SELECT
            id,
            message,
            kind,
            dismissible,
            starts_at,
            ends_at,
            COALESCE(component, 'banner') AS component,
            overlay_title,
            overlay_cta,
            ribbon_corner,
            github_url
          FROM config.announcements
          WHERE active = TRUE
            AND COALESCE(component, 'banner') = $1
            AND (starts_at IS NULL OR starts_at <= NOW())
            AND (ends_at IS NULL OR ends_at >= NOW())
          ORDER BY created_at DESC, id DESC
          LIMIT 1
        `,
        [component]
      ),
      client.query(
        `
          SELECT
            id,
            title,
            description,
            status_label,
            display_order
          FROM config.wip_items
          WHERE active = TRUE
          ORDER BY display_order ASC, id ASC
        `
      )
    ]);

    const settingMap = settingsResult.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    const announcement = announcementResult.rows[0] || null;
    const enabled = Boolean(announcement);

    return {
      enabled,
      message: announcement?.message || '',
      kind: announcement?.kind || 'dev',
      dismissible: announcement?.dismissible ?? true,
      component,
      overlay_title: announcement?.overlay_title || null,
      overlay_cta: announcement?.overlay_cta || null,
      ribbon_corner: announcement?.ribbon_corner || 'top-right',
      github_url: announcement?.github_url || settingMap.github_url || '',
      starts_at: announcement?.starts_at || null,
      ends_at: announcement?.ends_at || null,
      wip_items: wipResult.rows || []
    };
  }

  app.get('/api/config/announcement', async (req, res) => {
    let client;
    try {
      const component = normalizeAnnouncementComponent(req.query.component);

      if (!component) {
        return res.status(400).json({
          error: 'Invalid component. Use one of: banner, overlay, ribbon'
        });
      }

      client = await getDbClient();
      const config = await fetchAnnouncementConfig(client, component);
      return res.json(config);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    } finally {
      if (client) client.release();
    }
  });

  app.get('/api/config/dev-banner', async (req, res) => {
    let client;
    try {
      client = await getDbClient();
      const config = await fetchAnnouncementConfig(client, 'banner');
      return res.json(config);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    } finally {
      if (client) client.release();
    }
  });
  app.get('/api/personal_me/profile', async (req, res) => {
    let client;
    try {
      client = await getDbClient();

      const result = await client.query(`
        WITH latest_about AS (
          SELECT
            id,
            full_name,
            title AS role_title,
            bio,
            photo_url AS avatar_url,
            email,
            github_url AS github,
            linkedin_url AS linkedin,
            location,
            open_to_work,
            created_at,
            updated_at
          FROM personal.about_me
          ORDER BY updated_at DESC NULLS LAST, id DESC
          LIMIT 1
        ),
        stack AS (
          SELECT COALESCE(array_agg(name ORDER BY name), ARRAY[]::TEXT[]) AS tech_stack
          FROM projects.technology
        )
        SELECT
          latest_about.*,
          stack.tech_stack
        FROM latest_about
        CROSS JOIN stack
      `);

      res.json(result.rows[0] || null);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (client) client.release();
    }
  });

  app.get('/api/personal_me/projects', async (req, res) => {
    let client;
    try {
      client = await getDbClient();
      const result = await client.query(`
        SELECT
          p.id,
          p.name AS title,
          p.description,
          p.thumbnail_url AS image_url,
          p.demo_url AS project_url,
          p.github_url AS repo_url,
          p.kind,
          p.status,
          p.built_date,
          COALESCE(TO_CHAR(p.built_date, 'YYYY'), TO_CHAR(p.created_at, 'YYYY')) AS year,
          COALESCE(
            ARRAY_AGG(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL),
            ARRAY[]::TEXT[]
          ) AS tags
        FROM projects.project p
        LEFT JOIN projects.project_technology pt ON pt.project_id = p.id
        LEFT JOIN projects.technology t ON t.id = pt.technology_id
        GROUP BY p.id
        ORDER BY p.featured DESC, p.display_order ASC, p.built_date DESC NULLS LAST, p.id DESC
      `);

      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (client) client.release();
    }
  });

  app.get('/api/personal_me/technologies', async (req, res) => {
    let client;
    try {
      client = await getDbClient();
      const result = await client.query(`
        SELECT name, icon_url, accent_color, category
        FROM projects.technology
        ORDER BY name
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      if (client) client.release();
    }
  });

  const owner = 'Baldwin2318';
  const githubToken = process.env.GITHUB_TOKEN || critical_data.GITHUB_TOKEN || '';
  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {})
  };

  const configFiles = {
    'package.json': 'JavaScript/Node',
    'requirements.txt': 'Python',
    Pipfile: 'Python',
    'Package.swift': 'Swift',
    Podfile: 'Swift/iOS',
    'go.mod': 'Go',
    Gemfile: 'Ruby',
    'pom.xml': 'Java/Maven',
    'build.gradle': 'Java/Gradle',
    'composer.json': 'PHP'
  };

  const buildProject = (repo) => ({
    id: repo.id,
    title: repo.name,
    description: repo.description || '',
    repo_url: repo.html_url,
    html_url: repo.html_url,
    project_url: repo.homepage || '',
    year: new Date(repo.created_at).getFullYear(),
    status: 'active',
    tags: repo.topics || [],
    stack: [],
    frameworks: [],
    app_icon_url: null,
    is_ios_app: false,
    indicators: null
  });

  const fetchGithubJson = async (url) => {
    const response = await fetch(url, { headers: githubHeaders });
    if (!response.ok) {
      throw new Error(`GitHub API request failed (${response.status}) for ${url}`);
    }
    return response.json();
  };

  const fetchGithubProfile = async () => {
    const publicProfile = await fetchGithubJson(`https://api.github.com/users/${owner}`);
    let totalRepositories = publicProfile?.public_repos || 0;
    let privateRepositories = 0;

    try {
      const authenticatedProfile = await fetchGithubJson('https://api.github.com/user');
      if (authenticatedProfile?.login?.toLowerCase() === owner.toLowerCase()) {
        privateRepositories = authenticatedProfile.owned_private_repos || 0;
        totalRepositories = (authenticatedProfile.public_repos || 0) + privateRepositories;
      }
    } catch (profileErr) {
      privateRepositories = 0;
      totalRepositories = publicProfile?.public_repos || 0;
    }

    return {
      username: publicProfile?.login || owner,
      name: publicProfile?.name || '',
      bio: publicProfile?.bio || '',
      location: publicProfile?.location || '',
      company: publicProfile?.company || '',
      blog: publicProfile?.blog || '',
      profile_url: publicProfile?.html_url || '',
      avatar_url: publicProfile?.avatar_url || '',
      followers: publicProfile?.followers || 0,
      following: publicProfile?.following || 0,
      public_repositories: publicProfile?.public_repos || 0,
      private_repositories: privateRepositories,
      total_repositories: totalRepositories,
      public_gists: publicProfile?.public_gists || 0,
      account_created_at: publicProfile?.created_at || null,
      account_updated_at: publicProfile?.updated_at || null
    };
  };

  const fetchGithubGraphql = async (query, variables = {}) => {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...githubHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || `GitHub GraphQL request failed (${response.status})`);
    }

    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      throw new Error(payload.errors[0]?.message || 'GitHub GraphQL request failed.');
    }

    return payload.data;
  };

  let githubCommitTotalCache = { expiresAt: 0, value: null };

  const fetchGithubCommitTotal = async () => {
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN is missing. Add it to the server environment to fetch GitHub commit totals.');
    }

    if (githubCommitTotalCache.value && githubCommitTotalCache.expiresAt > Date.now()) {
      return githubCommitTotalCache.value;
    }

    const createdAtQuery = `
      query GetGithubUserCreatedAt($login: String!) {
        user(login: $login) {
          createdAt
          login
        }
      }
    `;

    const userData = await fetchGithubGraphql(createdAtQuery, { login: owner });
    const githubUser = userData?.user;

    if (!githubUser?.createdAt) {
      throw new Error(`Unable to load GitHub user metadata for ${owner}.`);
    }

    const now = new Date();
    const startYear = new Date(githubUser.createdAt).getUTCFullYear();
    const endYear = now.getUTCFullYear();
    const githubProfile = await fetchGithubProfile();

    const yearRanges = Array.from({ length: endYear - startYear + 1 }, (_, index) => {
      const year = startYear + index;
      return {
        year,
        from: `${year}-01-01T00:00:00Z`,
        to: year === endYear ? now.toISOString() : `${year + 1}-01-01T00:00:00Z`
      };
    });

    const contributionQuery = `
      query GetGithubCommitContributions($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
          }
        }
      }
    `;

    const yearlyTotals = await Promise.all(
      yearRanges.map(async ({ year, from, to }) => {
        const data = await fetchGithubGraphql(contributionQuery, {
          login: owner,
          from,
          to
        });

        return {
          year,
          total: data?.user?.contributionsCollection?.totalCommitContributions || 0
        };
      })
    );

    const payload = {
      username: githubUser.login,
      total_commits: yearlyTotals.reduce((sum, entry) => sum + entry.total, 0),
      total_repositories: githubProfile.total_repositories || 0,
      as_of: now.toISOString(),
      yearly_totals: yearlyTotals
    };

    githubCommitTotalCache = {
      value: payload,
      expiresAt: Date.now() + 30 * 60 * 1000
    };

    return payload;
  };

  const fetchRepoTree = async (repoName) => {
    try {
      const treeData = await fetchGithubJson(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`
      );
      return { treeData, branch: 'main' };
    } catch (mainErr) {
      const treeData = await fetchGithubJson(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/master?recursive=1`
      );
      return { treeData, branch: 'master' };
    }
  };

  const hydrateGithubProject = async (repo) => {
    const baseProject = buildProject(repo);

    try {
      const { treeData, branch } = await fetchRepoTree(repo.name);
      const treeItems = Array.isArray(treeData?.tree) ? treeData.tree : [];
      const stackSet = new Set();
      let packageJsonPath = null;
      let hasSwiftFile = false;

      treeItems.forEach((item) => {
        const itemPath = item?.path || '';
        const fileName = itemPath.split('/').pop();

        if (configFiles[fileName]) {
          stackSet.add(configFiles[fileName]);
        }

        if (itemPath.endsWith('.csproj')) {
          stackSet.add('C#');
        }

        if (itemPath.endsWith('.swift')) {
          hasSwiftFile = true;
        }

        if (!packageJsonPath && fileName === 'package.json') {
          packageJsonPath = itemPath;
        }
      });

      const iosDetection = detectiOSApp(treeItems);
      const appIconPath = findAppIcon(treeItems);

      if (iosDetection.isiOS) {
        stackSet.add('Swift/iOS');
      } else if (hasSwiftFile) {
        stackSet.add('Swift');
      }

      let frameworks = [];

      if (packageJsonPath) {
        const encodedPath = packageJsonPath
          .split('/')
          .map((segment) => encodeURIComponent(segment))
          .join('/');

        try {
          const packageJsonData = await fetchGithubJson(
            `https://api.github.com/repos/${owner}/${repo.name}/contents/${encodedPath}?ref=${branch}`
          );

          if (packageJsonData?.content) {
            const decodedPackageJson = Buffer.from(packageJsonData.content, 'base64').toString('utf8');
            const parsedPackageJson = JSON.parse(decodedPackageJson);
            const dependencies = Object.keys(parsedPackageJson.dependencies || {});
            const devDependencies = Object.keys(parsedPackageJson.devDependencies || {});
            frameworks = Array.from(new Set([...dependencies, ...devDependencies]));
          }
        } catch (packageErr) {
          frameworks = [];
        }
      }

      if (frameworks.length === 0 && hasSwiftFile) {
        const swiftFiles = treeItems
          .filter((item) => item?.type === 'blob' && (item?.path || '').endsWith('.swift'))
          .slice(0, 3);

        const importSet = new Set();

        await Promise.allSettled(
          swiftFiles.map(async (file) => {
            const encodedSwiftPath = (file.path || '')
              .split('/')
              .map((segment) => encodeURIComponent(segment))
              .join('/');

            const fileData = await fetchGithubJson(
              `https://api.github.com/repos/${owner}/${repo.name}/contents/${encodedSwiftPath}?ref=${branch}`
            );

            if (!fileData?.content) return;

            const decoded = Buffer.from(fileData.content, 'base64').toString('utf8');
            const imports = [...decoded.matchAll(/^import\s+(\w+)/gm)].map((match) => match[1]);
            imports.forEach((name) => importSet.add(name));
          })
        );

        frameworks = Array.from(importSet);
      }

      const appIconUrl = appIconPath
        ? `https://raw.githubusercontent.com/${owner}/${repo.name}/${branch}/${appIconPath}`
        : null;

      return {
        ...baseProject,
        stack: Array.from(stackSet),
        frameworks,
        app_icon_url: appIconUrl,
        is_ios_app: iosDetection.isiOS,
        indicators: iosDetection.indicators
      };
    } catch (repoErr) {
      return baseProject;
    }
  };

  const fetchGithubProjects = async () => {
    const reposResponse = await fetch(
      `https://api.github.com/users/${owner}/repos?sort=updated&per_page=100`,
      { headers: githubHeaders }
    );

    if (!reposResponse.ok) {
      throw new Error(`GitHub repos request failed (${reposResponse.status})`);
    }

    const repos = await reposResponse.json();

    const settledProjects = await Promise.allSettled(
      repos.map((repo) => hydrateGithubProject(repo))
    );

    return settledProjects.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      return buildProject(repos[index]);
    });
  };

  let portfolioChatCache = { expiresAt: 0, value: null };

  async function buildPortfolioChatContext() {
    if (portfolioChatCache.value && portfolioChatCache.expiresAt > Date.now()) {
      return portfolioChatCache.value;
    }

    const [projects, githubProfile, githubCommitTotals, client] = await Promise.all([
      fetchGithubProjects(),
      fetchGithubProfile(),
      fetchGithubCommitTotal(),
      getDbClient()
    ]);

    try {
      const [profileResult, techResult] = await Promise.all([
        client.query(`
          WITH latest_about AS (
            SELECT
              id,
              full_name,
              title AS role_title,
              bio,
              email,
              github_url AS github,
              linkedin_url AS linkedin,
              location,
              open_to_work,
              updated_at
            FROM personal.about_me
            ORDER BY updated_at DESC NULLS LAST, id DESC
            LIMIT 1
          )
          SELECT *
          FROM latest_about
        `),
        client.query(`
          SELECT name, category
          FROM projects.technology
          ORDER BY name
        `)
      ]);

      const profile = profileResult.rows[0] || {};
      const technologies = techResult.rows || [];
      const iosProjects = projects.filter((project) => project.is_ios_app);

      const context = {
        profile: {
          full_name: profile.full_name || '',
          role_title: profile.role_title || '',
          bio: compactText(profile.bio || '', 900),
          location: profile.location || '',
          open_to_work: profile.open_to_work ?? null,
          github: profile.github || '',
          linkedin: profile.linkedin || '',
          email: profile.email || ''
        },
        github_profile: {
          username: githubProfile.username || owner,
          name: githubProfile.name || '',
          bio: compactText(githubProfile.bio || '', 500),
          location: githubProfile.location || '',
          company: githubProfile.company || '',
          blog: githubProfile.blog || '',
          profile_url: githubProfile.profile_url || '',
          followers: githubProfile.followers || 0,
          following: githubProfile.following || 0,
          public_repositories: githubProfile.public_repositories || 0,
          private_repositories: githubProfile.private_repositories || 0,
          total_repositories: githubProfile.total_repositories || 0,
          public_gists: githubProfile.public_gists || 0,
          account_created_at: githubProfile.account_created_at || null,
          account_updated_at: githubProfile.account_updated_at || null
        },
        github_totals: {
          total_commits: githubCommitTotals.total_commits || 0,
          total_repositories: githubCommitTotals.total_repositories || 0,
          as_of: githubCommitTotals.as_of || null
        },
        technologies: technologies.slice(0, 40).map((item) => ({
          name: item.name,
          category: item.category || ''
        })),
        github_projects: projects.slice(0, 16).map((project) => ({
          title: project.title,
          description: compactText(project.description, 280),
          year: project.year,
          stack: (project.stack || []).slice(0, 8),
          frameworks: (project.frameworks || []).slice(0, 10),
          repo_url: project.repo_url || '',
          is_ios_app: Boolean(project.is_ios_app)
        })),
        ios_projects: iosProjects.slice(0, 10).map((project) => ({
          title: project.title,
          description: compactText(project.description, 280),
          year: project.year,
          stack: (project.stack || []).slice(0, 8),
          frameworks: (project.frameworks || []).slice(0, 10),
          repo_url: project.repo_url || ''
        }))
      };

      portfolioChatCache = {
        value: context,
        expiresAt: Date.now() + 5 * 60 * 1000
      };

      return context;
    } finally {
      client.release();
    }
  }

  async function askGeminiAboutPortfolio(message, context) {
    if (!critical_data.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing. Add it to the server environment to enable the portfolio assistant.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(critical_data.GEMINI_MODEL)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': critical_data.GEMINI_API_KEY
          },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: {
              parts: [
                {
                  text: [
                    "You are a portfolio assistant for Baldwin's personal website.",
                    'Answer only using the provided portfolio data and GitHub account data.',
                    `If the answer is not supported by the provided data, reply exactly with: ${CHAT_FALLBACK}`,
                    'You may answer questions about Baldwin, his portfolio, his GitHub profile, his GitHub repositories, and GitHub activity totals when those details are present in the provided data.',
                    'Do not use outside knowledge.',
                    'Do not guess, infer missing facts, or invent projects, dates, skills, employers, or GitHub stats that are not present in the provided data.',
                    'Keep responses concise and practical.'
                  ].join(' ')
                }
              ]
            },
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              maxOutputTokens: 220
            },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Portfolio data:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${message}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Gemini request failed.');
      }

      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || '')
        .join('')
        .trim();

      return answer || CHAT_FALLBACK;
    } finally {
      clearTimeout(timeout);
    }
  }

  app.get('/api/personal_me/github/projects', async (req, res) => {

    try {
      const projects = await fetchGithubProjects();
      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/personal_me/github/projects/ios', async (req, res) => {
    try {
      const projects = await fetchGithubProjects();
      const iosProjects = projects.filter((project) => project.is_ios_app);
      res.json(iosProjects);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/personal_me/github/commit-total', async (req, res) => {
    try {
      const commitTotal = await fetchGithubCommitTotal();
      res.json(commitTotal);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/chat/portfolio', async (req, res) => {
    try {
      const message = String(req.body?.message || '').trim();

      if (!message) {
        return res.status(400).json({ error: 'A message is required.' });
      }

      const context = await buildPortfolioChatContext();
      const answer = await askGeminiAboutPortfolio(message, context);
      return res.json({ answer });
    } catch (err) {
      if (isGeminiQuotaExceeded(err)) {
        return res.status(429).json({ error: CHAT_QUOTA_MESSAGE });
      }
      return res.status(500).json({ error: err.message || 'Unable to answer right now.' });
    }
  });

  app.use(express.static(path.join(__dirname, '../routes/static/build_baldwin_web_app_1/')));
}

export default baldwin_web_router1;
