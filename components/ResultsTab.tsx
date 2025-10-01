
import React, { useState, useMemo } from 'react';
import type { Channel, ProgressState } from '../types';
import { formatNumber } from '../utils/utils';
import { COUNTRIES } from '../constants';
import { exportToCsv, exportToJson } from '../utils/utils';

interface ResultsTabProps {
    results: Channel[];
    setResults: React.Dispatch<React.SetStateAction<Channel[]>>;
    isLoading: boolean;
    progress: ProgressState;
}

type SortKey = keyof Channel;
type SortOrder = 'asc' | 'desc';

const countryMap = new Map(COUNTRIES.map(c => [c.code, c.flag]));

export const ResultsTab: React.FC<ResultsTabProps> = ({ results, setResults, isLoading, progress }) => {
    const [sortKey, setSortKey] = useState<SortKey>('subscribers');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const sortedResults = useMemo(() => {
        const sorted = [...results].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return 0;
        });
        return sorted;
    }, [results, sortKey, sortOrder]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };
    
    const copyAllUrls = () => {
        const urls = sortedResults.map(c => c.url).join('\n');
        navigator.clipboard.writeText(urls);
        alert(`${sortedResults.length} URLs copied to clipboard!`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">Search in Progress...</h2>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div className="bg-teal-600 h-4 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                </div>
                <p className="text-gray-300">{progress.message}</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-400">No results to display.</h2>
                <p className="text-gray-500">Configure your search and click "Start Search" to see results here.</p>
            </div>
        );
    }
    
    const totalSubs = results.reduce((sum, c) => sum + c.subscribers, 0);
    const totalViews = results.reduce((sum, c) => sum + c.views, 0);

    return (
        <div className="space-y-6">
            {/* Stats Bar and Actions */}
            <div className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-4 sm:gap-6 text-center sm:text-left">
                    <div><span className="font-bold text-teal-400">{results.length}</span> <span className="text-gray-400">Channels</span></div>
                    <div><span className="font-bold text-teal-400">{formatNumber(totalSubs)}</span> <span className="text-gray-400">Total Subs</span></div>
                    <div><span className="font-bold text-teal-400">{formatNumber(totalViews)}</span> <span className="text-gray-400">Total Views</span></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => exportToCsv(sortedResults)} className="btn-secondary">Export CSV</button>
                    <button onClick={() => exportToJson(sortedResults)} className="btn-secondary">Export JSON</button>
                    <button onClick={copyAllUrls} className="btn-secondary">Copy URLs</button>
                    <button onClick={() => setResults([])} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">Clear</button>
                </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto bg-gray-800 rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-700 text-xs text-gray-400 uppercase">
                        <tr>
                            <th className="px-4 py-3"><SortableHeader name="Channel Name" sortKey="name" currentSort={sortKey} currentOrder={sortOrder} onSort={handleSort} /></th>
                            <th className="px-4 py-3"><SortableHeader name="Subscribers" sortKey="subscribers" currentSort={sortKey} currentOrder={sortOrder} onSort={handleSort} /></th>
                            <th className="px-4 py-3"><SortableHeader name="Videos" sortKey="videos" currentSort={sortKey} currentOrder={sortOrder} onSort={handleSort} /></th>
                            <th className="px-4 py-3"><SortableHeader name="Total Views" sortKey="views" currentSort={sortKey} currentOrder={sortOrder} onSort={handleSort} /></th>
                            <th className="px-4 py-3"><SortableHeader name="Avg Views" sortKey="avgViews" currentSort={sortKey} currentOrder={sortOrder} onSort={handleSort} /></th>
                            <th className="px-4 py-3"><SortableHeader name="Country" sortKey="country" currentSort={sortKey} currentOrder={sortOrder} onSort={handleSort} /></th>
                            <th className="px-4 py-3"><SortableHeader name="Age (d)" sortKey="age" currentSort={sortKey} currentOrder={sortOrder} onSort={handleSort} /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedResults.map(channel => (
                            <tr key={channel.id} onDoubleClick={() => window.open(channel.url, '_blank')} className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{channel.name}</td>
                                <td className="px-4 py-3">{formatNumber(channel.subscribers)}</td>
                                <td className="px-4 py-3">{formatNumber(channel.videos)}</td>
                                <td className="px-4 py-3">{formatNumber(channel.views)}</td>
                                <td className="px-4 py-3">{formatNumber(channel.avgViews)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{countryMap.get(channel.country) || ''} {channel.country}</td>
                                <td className="px-4 py-3">{channel.age}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`.btn-secondary { background-color: #2D2D2D; } .btn-secondary:hover { background-color: #424242; }`}</style>
        </div>
    );
};

interface SortableHeaderProps {
    name: string;
    sortKey: SortKey;
    currentSort: SortKey;
    currentOrder: SortOrder;
    onSort: (key: SortKey) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ name, sortKey, currentSort, currentOrder, onSort }) => {
    const isCurrent = currentSort === sortKey;
    const icon = isCurrent ? (currentOrder === 'asc' ? '▲' : '▼') : '';
    return (
        <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 hover:text-white focus:outline-none">
            {name} <span className="text-teal-400">{icon}</span>
        </button>
    );
};
