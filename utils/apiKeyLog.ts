export interface ApiKeyLogEntry {
  key: string;
  time: string;
  ip: string;
}

export function saveApiKeyLog(entry: ApiKeyLogEntry) {
  const logs = getApiKeyLogs();
  logs.push(entry);
  localStorage.setItem('apiKeyLogs', JSON.stringify(logs));
}

export function getApiKeyLogs(): ApiKeyLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem('apiKeyLogs') || '[]');
  } catch {
    return [];
  }
}

export async function saveApiKeyLogToSheet(entry: { key: string; time: string; ip: string }) {
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbxyvejRwsOXUg0Md2c699MAmwcrHHYpLZ9x2Iimd0b7NzJvWZ6JYZWqRUZ-EupEMO2q/exec';
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(entry),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    // Có thể xử lý lỗi nếu cần
  }
}
