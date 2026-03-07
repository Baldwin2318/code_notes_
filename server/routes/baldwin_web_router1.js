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

function baldwin_web_router1(app) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (val) => val);
  pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (val) => val);

  app.get('/api/config/dev-banner', async (req, res) => {
    let client;
    try {
      client = await getDbClient();

      const [settingsResult, announcementResult] = await Promise.all([
        client.query(
          `
            SELECT key, value
            FROM config.site_settings
            WHERE key IN ('banner_enabled', 'banner_message', 'github_url')
          `
        ),
        client.query(
          `
            SELECT id, message, kind, dismissible, starts_at, ends_at
            FROM config.announcements
            WHERE active = TRUE
              AND starts_at <= NOW()
              AND (ends_at IS NULL OR ends_at >= NOW())
            ORDER BY created_at DESC, id DESC
            LIMIT 1
          `
        )
      ]);

      const settingMap = settingsResult.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      const announcement = announcementResult.rows[0] || null;
      const enabled = parseBoolean(settingMap.banner_enabled, false);

      res.json({
        enabled,
        message: announcement?.message || settingMap.banner_message || '',
        kind: announcement?.kind || 'dev',
        dismissible: announcement?.dismissible ?? true,
        github_url: settingMap.github_url || '',
        starts_at: announcement?.starts_at || null,
        ends_at: announcement?.ends_at || null
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
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

  app.get('/api/personal_me/github/projects', async (req, res) => {
    const owner = 'Baldwin2318';
    const githubHeaders = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
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
      project_url: repo.homepage || '',
      year: new Date(repo.created_at).getFullYear(),
      status: 'active',
      tags: repo.topics || [],
      stack: [],
      frameworks: []
    });

    const fetchGithubJson = async (url) => {
      const response = await fetch(url, { headers: githubHeaders });
      if (!response.ok) {
        throw new Error(`GitHub API request failed (${response.status}) for ${url}`);
      }
      return response.json();
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

    try {
      const reposResponse = await fetch(
        `https://api.github.com/users/${owner}/repos?sort=updated&per_page=100`,
        { headers: githubHeaders }
      );

      if (!reposResponse.ok) {
        throw new Error(`GitHub repos request failed (${reposResponse.status})`);
      }

      const repos = await reposResponse.json();

      const settledProjects = await Promise.allSettled(
        repos.map(async (repo) => {
          const baseProject = buildProject(repo);

          try {
            const { treeData, branch } = await fetchRepoTree(repo.name);
            const treeItems = Array.isArray(treeData?.tree) ? treeData.tree : [];
            const stackSet = new Set();
            let packageJsonPath = null;
            let hasXcodeProject = false;
            let hasXcodeWorkspace = false;
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

              if (/\.xcodeproj(?:\/|$)/.test(itemPath)) {
                hasXcodeProject = true;
              }

              if (/\.xcworkspace(?:\/|$)/.test(itemPath)) {
                hasXcodeWorkspace = true;
              }

              if (itemPath.endsWith('.swift')) {
                hasSwiftFile = true;
              }

              if (!packageJsonPath && fileName === 'package.json') {
                packageJsonPath = itemPath;
              }
            });

            if (hasXcodeProject || hasXcodeWorkspace) {
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

            // Swift/iOS projects often use only Apple SDK frameworks.
            // For those, detect imports from a small sample of Swift source files.
            if (frameworks.length === 0 && hasSwiftFile) {
              const swiftFiles = treeItems
                .filter((item) => item?.type === 'blob' && (item?.path || '').endsWith('.swift'))
                .slice(0, 3);

              const importSet = new Set();

              const swiftFileResults = await Promise.allSettled(
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
                  const imports = [...decoded.matchAll(/^import\s+(\w+)/gm)].map((m) => m[1]);
                  imports.forEach((name) => importSet.add(name));
                })
              );

              if (swiftFileResults.length > 0) {
                frameworks = Array.from(importSet);
              }
            }

            return {
              ...baseProject,
              stack: Array.from(stackSet),
              frameworks
            };
          } catch (repoErr) {
            return baseProject;
          }
        })
      );

      const projects = settledProjects.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        return buildProject(repos[index]);
      });

      res.json(projects);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use(express.static(path.join(__dirname, '../routes/static/build_baldwin_web_app_1/')));
}

export default baldwin_web_router1;
