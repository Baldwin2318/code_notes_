import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const owner = 'Baldwin2318';
const githubHeaders = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
};

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

function findScreenshots(tree) {
  return tree
    .map((item) => item.path || '')
    .filter((p) => (
      p.startsWith('SCREENSHOTS/') &&
      !p.endsWith('/') &&
      (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg') || p.endsWith('.webp') || 
        p.endsWith('.PNG') || p.endsWith('.JPG') || p.endsWith('.JPEG') || p.endsWith('.WEBP'))
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

async function fetchReadmeDescription(repoName, branch) {
  const readmeCandidates = ['README.md', 'README.MD', 'readme.md'];

  for (const candidate of readmeCandidates) {
    try {
      const encodedPath = candidate
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');

      const readmeData = await fetchGithubJson(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${encodedPath}?ref=${branch}`
      );

      if (!readmeData?.content) continue;

      const decoded = Buffer.from(readmeData.content, 'base64').toString('utf8');
      const sections = decoded
        .split(/\n{2,}/)
        .map((section) => section.replace(/^#+\s*/gm, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim())
        .filter(Boolean)
        .filter((section) => !section.startsWith('!['))
        .slice(0, 3);

      return sections;
    } catch (error) {
      continue;
    }
  }

  return [];
}

async function fetchIOSRepoDetails(repoName) {
  const repo = await fetchGithubJson(`https://api.github.com/repos/${owner}/${repoName}`);
  const { treeData, branch } = await fetchRepoTree(repoName);
  const treeItems = Array.isArray(treeData?.tree) ? treeData.tree : [];
  const iosDetection = detectiOSApp(treeItems);

  if (!iosDetection.isiOS) {
    const error = new Error('Requested repository is not detected as an iOS app.');
    error.statusCode = 404;
    throw error;
  }

  const appIconPath = findAppIcon(treeItems);
  const screenshotPaths = findScreenshots(treeItems);
  const readmeSections = await fetchReadmeDescription(repoName, branch);

  return {
    id: repo.id,
    repo_name: repo.name,
    title: repo.name,
    description: repo.description || 'No repository description available.',
    long_description: readmeSections,
    repo_url: repo.html_url,
    project_url: repo.homepage || '',
    year: new Date(repo.created_at).getFullYear(),
    app_icon_url: appIconPath ? toRawGithubUrl(repo.name, branch, appIconPath) : null,
    screenshots: screenshotPaths.map((filePath) => toRawGithubUrl(repo.name, branch, filePath)),
    indicators: iosDetection.indicators
  };
}

function ios_project_router(app) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const buildDir = path.join(__dirname, './static/build_ios_project_page');

  app.get('/api/ios_app/:repoName', async (req, res) => {
    try {
      const repoName = decodeURIComponent(req.params.repoName || '').trim();

      if (!repoName) {
        return res.status(400).json({ error: 'repoName is required.' });
      }

      const details = await fetchIOSRepoDetails(repoName);
      return res.json(details);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message });
    }
  });

  app.use('/ios_project_assets', express.static(buildDir));

  app.get(/^\/ios_app_.*/, (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

export default ios_project_router;
