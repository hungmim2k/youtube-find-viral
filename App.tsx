import React, { useState, useCallback, useRef } from 'react';
import AuthorFooter, { DonateQR } from './components/AuthorFooter';
import PasswordGate from './components/PasswordGate';
import { ApiConfigTab } from './components/ApiConfigTab';
import { SearchSettingsTab } from './components/SearchSettingsTab';
import { ResultsTab } from './components/ResultsTab';
import { ApiKeyManager } from './services/youtubeService';
import type { Channel, SearchSettings } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

type Tab = 'api' | 'search' | 'results';

const App: React.FC = () => {
    const [unlocked, setUnlocked] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('api');
    const [apiKeys, setApiKeys] = useLocalStorage<string[]>('yt-api-keys', []);
    const [searchSettings, setSearchSettings] = useLocalStorage<SearchSettings>('yt-search-settings', {
        keywords: '',
        searchMethods: { keyword: true, channel: false, tags: false, channelKeywords: false },
        countries: ['US'],
        includeUnknown: false,
        filters: {
            subs: { min: '1k', max: '' },
            views: { min: '', max: '' },
            videos: { min: '', max: '' },
            age: { min: '', max: '' },
            publishedAfter: '',
        },
        maxResultsPerKeyword: 100,
        sortBy: 'subscribers',
        sortOrder: 'desc',
    });
    const [results, setResults] = useState<Channel[]>([]);
    const [showDonate, setShowDonate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });

    const apiKeyManagerRef = useRef<ApiKeyManager>(new ApiKeyManager([]));
    
    const handleSearch = useCallback(async (settings: SearchSettings) => {
        setIsLoading(true);
        setResults([]);
        setProgress({ current: 0, total: 100, message: 'Initializing search...' });
        setActiveTab('results');
        
        apiKeyManagerRef.current = new ApiKeyManager(apiKeys);
        
        if (apiKeyManagerRef.current.getKeyCount() === 0) {
            setProgress({ current: 100, total: 100, message: 'Error: No API keys configured.' });
            setIsLoading(false);
            return;
        }

        try {
            await apiKeyManagerRef.current.startSearch(settings, setProgress, (newResults) => {
                setResults(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const uniqueNewResults = newResults.filter(c => !existingIds.has(c.id));
                    return [...prev, ...uniqueNewResults];
                });
            });
            setProgress(prev => ({ ...prev, message: `Search complete! Found ${results.length} channels.` }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setProgress({ current: 100, total: 100, message: `Error: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    }, [apiKeys, results.length]);


    const renderTabContent = () => {
        switch (activeTab) {
            case 'api':
                return <ApiConfigTab apiKeys={apiKeys} setApiKeys={setApiKeys} />;
            case 'search':
                return <SearchSettingsTab settings={searchSettings} setSettings={setSearchSettings} onSearch={handleSearch} isLoading={isLoading} />;
            case 'results':
                return <ResultsTab results={results} setResults={setResults} isLoading={isLoading} progress={progress} />;
            default:
                return null;
        }
    };

    if (!unlocked) {
        return <PasswordGate onSuccess={() => {
            setUnlocked(true);
            setActiveTab('api');
        }} />;
    }
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 flex flex-col">
            <div className="max-w-7xl mx-auto flex-1 w-full">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Find Viral Channel Youtube 2025</h1>
                    <p className="text-gray-400 mt-1">Công cụ tìm kiếm và phân tích kênh YouTube mạnh mẽ.</p>
                </header>

                <div className="flex border-b border-gray-700 mb-6">
                    <TabButton title="Quản lý API Key" isActive={activeTab === 'api'} onClick={() => setActiveTab('api')} />
                    <TabButton title="Cài đặt tìm kiếm" isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                    <TabButton title="Kết quả" isActive={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                </div>

                <main>
                    {renderTabContent()}
                </main>
            </div>
            <AuthorFooter onDonate={() => setShowDonate(true)} />
            {showDonate && <DonateQR onClose={() => setShowDonate(false)} />}
        </div>
    );
};

interface TabButtonProps {
    title: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 font-semibold text-sm focus:outline-none transition-colors duration-200 ${
            isActive
                ? 'border-b-2 border-teal-500 text-teal-400'
                : 'text-gray-400 hover:text-white'
        }`}
    >
        {title}
    </button>
);


export default App;