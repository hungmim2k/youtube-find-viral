import React, { useState } from 'react';
import { getApiKeyLogs } from '../utils/apiKeyLog';

const AdminApiKeyLog: React.FC = () => {
  const [logs, setLogs] = useState(getApiKeyLogs());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative animate-fade-in">
        <button
          onClick={() => window.location.reload()}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
          aria-label="Đóng"
        >×</button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Bảng log API Key đã nhập</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 border">API Key</th>
                <th className="px-3 py-2 border">Thời gian nhập</th>
                <th className="px-3 py-2 border">IP máy nhập</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-4 text-gray-500">Chưa có log nào</td></tr>
              ) : logs.map((log, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2 border font-mono">{log.key}</td>
                  <td className="px-3 py-2 border">{log.time}</td>
                  <td className="px-3 py-2 border">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminApiKeyLog;
