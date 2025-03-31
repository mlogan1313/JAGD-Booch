import { Batch } from '../types/batch';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'mlogan1313';
const REPO_NAME = 'JAGD-Booch';
const DATA_PATH = 'data/batches';

interface GitHubResponse {
  sha: string;
  content: string;
  encoding: string;
}

export class GitHubService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${error}`);
    }

    return response.json();
  }

  async getBatch(batchId: string): Promise<Batch> {
    const response = await this.fetchWithAuth(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}/${batchId}.json`
    ) as GitHubResponse;

    const content = atob(response.content);
    return JSON.parse(content);
  }

  async getAllBatches(): Promise<Batch[]> {
    const response = await this.fetchWithAuth(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`
    ) as { name: string }[];

    const batchFiles = response.filter(file => file.name.endsWith('.json'));
    const batches = await Promise.all(
      batchFiles.map(file => this.getBatch(file.name.replace('.json', '')))
    );

    return batches;
  }

  async createBatch(batch: Batch): Promise<void> {
    const content = JSON.stringify(batch, null, 2);
    const message = `Create batch: ${batch.name}`;

    await this.fetchWithAuth(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}/${batch.id}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({
          message,
          content: btoa(content),
        }),
      }
    );
  }

  async updateBatch(batch: Batch): Promise<void> {
    // First, get the current file to get its SHA
    const currentFile = await this.fetchWithAuth(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}/${batch.id}.json`
    ) as GitHubResponse;

    const content = JSON.stringify(batch, null, 2);
    const message = `Update batch: ${batch.name}`;

    await this.fetchWithAuth(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}/${batch.id}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({
          message,
          content: btoa(content),
          sha: currentFile.sha,
        }),
      }
    );
  }

  async deleteBatch(batchId: string): Promise<void> {
    // First, get the current file to get its SHA
    const currentFile = await this.fetchWithAuth(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}/${batchId}.json`
    ) as GitHubResponse;

    await this.fetchWithAuth(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}/${batchId}.json`,
      {
        method: 'DELETE',
        body: JSON.stringify({
          message: `Delete batch: ${batchId}`,
          sha: currentFile.sha,
        }),
      }
    );
  }
} 