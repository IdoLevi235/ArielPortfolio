import { Octokit } from '@octokit/rest';

// ---------------------------------------------------------------------------
// Configuration — read from environment
// ---------------------------------------------------------------------------

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }
  return new Octokit({ auth: token });
}

function getRepoInfo(): { owner: string; repo: string } {
  const raw = process.env.GITHUB_REPO;
  if (!raw) {
    throw new Error('GITHUB_REPO environment variable is not set (expected format: owner/name)');
  }
  const [owner, repo] = raw.split('/');
  if (!owner || !repo) {
    throw new Error(`GITHUB_REPO must be in the format "owner/name", got: ${raw}`);
  }
  return { owner, repo };
}

function getBranch(): string {
  return process.env.GITHUB_BRANCH ?? 'main';
}

const CONTENT_FILE_PATH = 'site/data/content.json';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the current content.json from GitHub.
 * Returns the parsed JSON and the blob SHA needed for subsequent updates.
 */
export async function getRemoteContent(): Promise<{ content: unknown; sha: string }> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();
  const branch = getBranch();

  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: CONTENT_FILE_PATH,
    ref: branch,
  });

  // The response is a file object when path points to a file
  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`Unexpected response type from GitHub contents API: ${Array.isArray(data) ? 'array' : (data as { type: string }).type}`);
  }

  const fileData = data as { content: string; sha: string; encoding: string };
  const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const parsed: unknown = JSON.parse(decoded);

  return { content: parsed, sha: fileData.sha };
}

/**
 * Commit updated content.json to GitHub.
 *
 * @param content  The new content (will be serialised as pretty JSON).
 * @param sha      The current blob SHA. If omitted, it is fetched automatically.
 * @param message  Commit message (defaults to "content: update via admin").
 */
export async function commitContent(
  content: unknown,
  sha?: string,
  message?: string,
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();
  const branch = getBranch();

  // Resolve SHA if not provided
  const blobSha = sha ?? (await getRemoteContent()).sha;

  const encoded = Buffer.from(JSON.stringify(content, null, 2) + '\n').toString('base64');

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: CONTENT_FILE_PATH,
    message: message ?? 'content: update via admin',
    content: encoded,
    sha: blobSha,
    branch,
  });
}
