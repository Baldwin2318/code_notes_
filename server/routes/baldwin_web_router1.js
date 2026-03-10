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
      )
    ]);

    const settingMap = settingsResult.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    const announcement = announcementResult.rows[0] || null;
    const enabled = component === 'banner' ? parseBoolean(settingMap.banner_enabled, false) : Boolean(announcement);

    return {
      enabled,
      message: announcement?.message || (component === 'banner' ? settingMap.banner_message || '' : ''),
      kind: announcement?.kind || 'dev',
      dismissible: announcement?.dismissible ?? true,
      component,
      overlay_title: announcement?.overlay_title || null,
      overlay_cta: announcement?.overlay_cta || null,
      ribbon_corner: announcement?.ribbon_corner || 'top-right',
      github_url: announcement?.github_url || settingMap.github_url || '',
      starts_at: announcement?.starts_at || null,
      ends_at: announcement?.ends_at || null
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

  app.use(express.static(path.join(__dirname, '../routes/static/build_baldwin_web_app_1/')));
}

export default baldwin_web_router1;
