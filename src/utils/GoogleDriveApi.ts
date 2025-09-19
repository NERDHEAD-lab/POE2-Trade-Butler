import { ping } from './api';

class GoogleDriveApi {
  private static async getAccessToken(): Promise<string> {
    await ping();
    const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN' });
    if (response.error) {
      throw new Error(`Error getting auth token: ${response.error}`);
    }
    return response.token as string;
  }

  private static async removeCachedAccessToken(): Promise<void> {
    await ping();
    const response = await chrome.runtime.sendMessage({ type: 'REMOVE_CACHED_ACCESS_TOKEN' });
    if (response.error) {
      throw new Error(`Error removing cached auth token: ${response.error}`);
    }
  }

  private static async fetchWithAuth(url: string, options: RequestInit = {}, retry: boolean = true): Promise<Response> {
    const token = await this.getAccessToken();
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retry) {
      console.warn('Token expired or revoked. Re-authenticating...');
      await this.removeCachedAccessToken();
      const newToken = await this.getAccessToken();
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    }
    return response;
  }

  static async findFile(name: string): Promise<string | null> {
    const response = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(`name='${name}' and trashed=false`));
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }

  static async createFile(name: string, content: string): Promise<string> {
    const metaData = { name: name, mimeType: 'application/json' };
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metaData)], { type: 'application/json' }));
    formData.append('file', new Blob([content], { type: 'application/json' }));

    const response = await this.fetchWithAuth('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return data.id;
  }

  static async readFile(fileId: string): Promise<string> {
    const response = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return response.text();
  }

  static async updateFile(fileId: string, content: string): Promise<void> {
    await this.fetchWithAuth(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: content,
    });
  }
}


export { GoogleDriveApi };