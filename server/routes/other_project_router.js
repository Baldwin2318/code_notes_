import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const owner = 'Baldwin2318';
const githubHeaders = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
};

function extractProjectType(configText) {
  const text = String(configText || '');
  const match = text.match(/project_type\s*=\s*['"]?([a-z0-9_-]+)['"]?/i);
  return match?.[1]?.trim().toLowerCase() || '';
}

function findScreenshots(tree) {
  return tree
    .map((item) => item.path || '')
    .filter((filePath) => (
      filePath.startsWith('SCREENSHOTS/') &&
      /\.(png|jpe?g|webp|gif)$/i.test(filePath)
    ))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function toRawGithubUrl(repoName, branch, filePath) {
  return `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${filePath}`;
}

async function fetchGithubJson(url) {
  const response = await fetch(url, { headers: githubHeaders });
  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) for ${url}`);
  }
  return response.json();
}

async function fetchRepoTree(repoName) {
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
}

async function fetchMarkdownFile(repoName, branch, candidates) {
  for (const candidate of candidates) {
    try {
      const encodedPath = candidate
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

      const data = await fetchGithubJson(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${encodedPath}?ref=${branch}`
      );

      if (!data?.content) continue;
      return Buffer.from(data.content, 'base64').toString('utf8');
    } catch (error) {
      continue;
    }
  }

  return '';
}

async function fetchOtherProjectDetails(repoName) {
  const repo = await fetchGithubJson(`https://api.github.com/repos/${owner}/${repoName}`);
  const { treeData, branch } = await fetchRepoTree(repoName);
  const treeItems = Array.isArray(treeData?.tree) ? treeData.tree : [];
  const configMarkdown = await fetchMarkdownFile(repoName, branch, ['Config.md', 'CONFIG.md', 'config.md']);
  const projectType = extractProjectType(configMarkdown);

  if (projectType !== 'other') {
    const error = new Error('Requested repository is not marked as an other project.');
    error.statusCode = 404;
    throw error;
  }

  const screenshotPaths = findScreenshots(treeItems);
  const readmeMarkdown = await fetchMarkdownFile(repoName, branch, ['README.md', 'README.MD', 'readme.md']);
  const aboutMarkdown = await fetchMarkdownFile(repoName, branch, ['About.md', 'About.MD', 'ABOUT.md', 'about.md']);
  const hasParts = treeItems.some((item) => (item.path || '').startsWith('PARTS/'));
  const hasAssembled = treeItems.some((item) => (item.path || '').startsWith('ASSEMBLED/'));
  const hasCode = treeItems.some((item) => (item.path || '').startsWith('CODE/'));

  return {
    id: repo.id,
    repo_name: repo.name,
    title: repo.name,
    description: repo.description || 'No repository description available.',
    about_markdown: aboutMarkdown,
    readme_markdown: readmeMarkdown,
    config_markdown: configMarkdown,
    repo_url: repo.html_url,
    project_url: `/${encodeURIComponent(repo.name)}`,
    year: new Date(repo.created_at).getFullYear(),
    screenshots: screenshotPaths.map((filePath) => toRawGithubUrl(repo.name, branch, filePath)),
    folders: {
      parts_url: hasParts ? `${repo.html_url}/tree/${branch}/PARTS` : '',
      assembled_url: hasAssembled ? `${repo.html_url}/tree/${branch}/ASSEMBLED` : '',
      code_url: hasCode ? `${repo.html_url}/tree/${branch}/CODE` : '',
      config_url: configMarkdown ? `${repo.html_url}/blob/${branch}/Config.md` : '',
      about_url: aboutMarkdown ? `${repo.html_url}/blob/${branch}/About.md` : ''
    }
  };
}

function other_project_router(app) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const buildDir = path.join(__dirname, './static/build_other_project_page');

  app.get('/api/other_project/:repoName', async (req, res) => {
    try {
      const repoName = decodeURIComponent(req.params.repoName || '').trim();

      if (!repoName) {
        return res.status(400).json({ error: 'repoName is required.' });
      }

      const details = await fetchOtherProjectDetails(repoName);
      return res.json(details);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message });
    }
  });

  app.use('/other_project_assets', express.static(buildDir));

  app.get(/^\/(?!$|api(?:\/|$)|ios_app_|ios_project_assets(?:\/|$)|other_project_assets(?:\/|$))[^/]+$/, (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

export default other_project_router;
