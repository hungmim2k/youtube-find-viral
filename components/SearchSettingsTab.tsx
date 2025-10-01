import React, { useState, useEffect } from 'react';
import type { SearchSettings } from '../types';
import { COUNTRIES, HIGH_RPM_COUNTRIES, TIME_FILTERS } from '../constants';

// API endpoint MongoDB
const LOG_KEYWORD_ENDPOINT = '/api/log-keyword';
const GET_KEYWORD_LOGS_ENDPOINT = '/api/get-keyword-logs';

interface SearchSettingsTabProps {
    settings: SearchSettings;
    setSettings: React.Dispatch<React.SetStateAction<SearchSettings>>;
    onSearch: (settings: SearchSettings) => void;
    isLoading: boolean;
}

export const SearchSettingsTab: React.FC<SearchSettingsTabProps> = ({ settings, setSettings, onSearch, isLoading }) => {
    const [keywordLogs, setKeywordLogs] = useState<{ip: string, keyword: string, time: string}[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    const fetchKeywordLogs = async () => {
        try {
            const resp = await fetch(GET_KEYWORD_LOGS_ENDPOINT);
            const data = await resp.json();
            setKeywordLogs(data.logs || []);
        } catch (e) {
            setKeywordLogs([]);
        }
    };

    useEffect(() => {
        if (showLogs) fetchKeywordLogs();
    }, [showLogs]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [filter, key] = name.split('.');
        setSettings(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                // FIX: Narrows type assertion to exclude string-based filters like `publishedAfter`,
                // which cannot be spread. This resolves the "Spread types may only be created from object types" error.
                [filter]: { ...prev.filters[filter as keyof Omit<SearchSettings['filters'], 'publishedAfter'>], [key]: value }
            }
        }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        const [group, key] = name.split('.');
         if (group === 'searchMethods') {
            setSettings(prev => ({
                ...prev,
                searchMethods: { ...prev.searchMethods, [key]: checked }
            }));
        } else if (group === 'settings' && key === 'includeUnknown') {
            // FIX: Made the handler specific to avoid potential type errors with a generic key.
            setSettings(prev => ({ ...prev, includeUnknown: checked }));
        }
    };
    
    const handleCountryChange = (countryCode: string) => {
        setSettings(prev => {
            const newCountries = prev.countries.includes(countryCode)
                ? prev.countries.filter(c => c !== countryCode)
                : [...prev.countries, countryCode];
            return { ...prev, countries: newCountries };
        });
    };

    const logKeywords = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            await fetch(LOG_KEYWORD_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: data.ip || 'unknown',
                    keyword: settings.keywords,
                    time: new Date().toLocaleString(),
                }),
            });
        } catch {
            await fetch(LOG_KEYWORD_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: 'unknown',
                    keyword: settings.keywords,
                    time: new Date().toLocaleString(),
                }),
            });
        }
    };

    const handleSearchClick = () => {
        logKeywords();
        onSearch(settings);
    };
    
    return (
        <div className="space-y-8">
            <button
                onClick={() => setShowLogs(l => !l)}
                className="mb-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-md transition-colors shadow"
            >
                {showLogs ? 'Ẩn bảng log Keyword' : 'Xem bảng log Keyword'}
            </button>
            {showLogs && (
                <div className="my-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h3 className="text-lg font-semibold text-teal-300 mb-2">Bảng log Keyword</h3>
                    <table className="min-w-full text-xs text-gray-200">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-2 py-1">IP</th>
                                <th className="px-2 py-1">Keyword</th>
                                <th className="px-2 py-1">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keywordLogs.length === 0 ? (
                                <tr><td colSpan={3} className="text-center py-2">Không có dữ liệu</td></tr>
                            ) : (
                                keywordLogs.map((log, idx) => (
                                    <tr key={idx} className="border-b border-gray-700">
                                        <td className="px-2 py-1">{log.ip}</td>
                                        <td className="px-2 py-1">{log.keyword}</td>
                                        <td className="px-2 py-1">{log.time}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Search Section */}
            <Section title="Search Configuration">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="keywords">Keywords</Label>
                        <textarea
                            id="keywords"
                            name="keywords"
                            value={settings.keywords}
                            onChange={handleInputChange}
                            placeholder="e.g., gaming, tech reviews, cooking"
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Separate multiple keywords with commas.</p>
                    </div>
                    <div>
                        <Label>Search Methods</Label>
                        <div className="space-y-2 mt-2">
                           <Checkbox name="searchMethods.keyword" checked={settings.searchMethods.keyword} onChange={handleCheckboxChange} label="Keyword Search (in video title/desc)" />
                           <Checkbox name="searchMethods.channel" checked={settings.searchMethods.channel} onChange={handleCheckboxChange} label="Channel Description Search" />
                           <Checkbox name="searchMethods.channelKeywords" checked={settings.searchMethods.channelKeywords} onChange={handleCheckboxChange} label="Channel Keywords Search" />
                           <Checkbox name="searchMethods.tags" checked={settings.searchMethods.tags} onChange={handleCheckboxChange} label="Video Tags Analysis" />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Country Selection */}
            <Section title="Country & Region Selection">
                 <div className="flex flex-wrap gap-2 mb-4">
                    <button onClick={() => setSettings(p => ({ ...p, countries: COUNTRIES.map(c => c.code) }))} className="btn-secondary">Select All</button>
                    <button onClick={() => setSettings(p => ({ ...p, countries: [] }))} className="btn-secondary">Clear All</button>
                    <button onClick={() => setSettings(p => ({ ...p, countries: HIGH_RPM_COUNTRIES }))} className="btn-secondary">High RPM</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {COUNTRIES.map(country => (
                        <CountryCheckbox key={country.code} country={country} isSelected={settings.countries.includes(country.code)} onChange={handleCountryChange} />
                    ))}
                </div>
                <div className="mt-4">
                     <Checkbox name="settings.includeUnknown" checked={settings.includeUnknown} onChange={handleCheckboxChange} label="Include channels with unknown country" />
                </div>
            </Section>

            {/* Advanced Filters */}
            <Section title="Advanced Filters">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                   <FilterInput name="subs" label="Subscribers" value={settings.filters.subs} onChange={handleFilterChange} />
                   <FilterInput name="views" label="Total Views" value={settings.filters.views} onChange={handleFilterChange} />
                   <FilterInput name="videos" label="Total Videos" value={settings.filters.videos} onChange={handleFilterChange} />
                   <FilterInput name="age" label="Channel Age (days)" value={settings.filters.age} onChange={handleFilterChange} />
                   <div>
                       <Label htmlFor="publishedAfter">Time Filter</Label>
                       <select id="publishedAfter" name="publishedAfter" value={settings.filters.publishedAfter} onChange={(e) => setSettings(p=>({...p, filters: {...p.filters, publishedAfter: e.target.value}}))} className="mt-1 input-base text-gray-900">
                           {TIME_FILTERS.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
                       </select>
                   </div>
                   <div>
                       <Label htmlFor="maxResultsPerKeyword">Max Results / Keyword</Label>
                       <select id="maxResultsPerKeyword" name="maxResultsPerKeyword" value={settings.maxResultsPerKeyword} onChange={handleInputChange} className="mt-1 input-base text-gray-900">
                           {[20, 50, 100, 200, 500].map(val => <option key={val} value={val}>{val}</option>)}
                       </select>
                   </div>
                </div>
            </Section>
            
            {/* Search Action */}
            <div className="pt-6 border-t border-gray-700">
                <button onClick={handleSearchClick} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-md transition-colors text-lg">
                    {isLoading ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Searching...
                        </>
                    ) : 'Start Search'}
                </button>
            </div>
        </div>
    );
};

// Sub-components for better structure
const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">{title}</h2>
        {children}
    </div>
);

const Label: React.FC<{ htmlFor?: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300">{children}</label>
);

const Checkbox: React.FC<{ name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string }> = ({ name, checked, onChange, label }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-teal-600 focus:ring-teal-500"/>
        <span className="text-gray-300">{label}</span>
    </label>
);

const CountryCheckbox: React.FC<{ country: {code: string, name: string, flag: string}, isSelected: boolean, onChange: (code: string) => void }> = ({ country, isSelected, onChange}) => (
    <label className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-teal-800' : 'bg-gray-700 hover:bg-gray-600'}`}>
        <input type="checkbox" checked={isSelected} onChange={() => onChange(country.code)} className="hidden" />
        <span className="text-lg">{country.flag}</span>
        <span className="text-sm font-medium">{country.code}</span>
    </label>
);

const FilterInput: React.FC<{ name: string, label: string, value: { min: string, max: string }, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ name, label, value, onChange }) => (
    <div>
        <Label>{label}</Label>
        <div className="flex items-center gap-2 mt-1">
            <input type="text" name={`${name}.min`} value={value.min} onChange={onChange} placeholder="Min" className="input-base w-full text-gray-900"/>
            <span className="text-gray-400">-</span>
            <input type="text" name={`${name}.max`} value={value.max} onChange={onChange} placeholder="Max" className="input-base w-full text-gray-900"/>
        </div>
         <p className="text-xs text-gray-400 mt-1">Use k/m/b for thousands/millions/billions.</p>
    </div>
);

// Add base styles to index.html or a global CSS file if needed. For this single-file setup, we use a utility class approach.
const baseInputStyle = "bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500";
const baseBtnSecondaryStyle = "bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-md text-sm transition-colors";

// Manually add these to your components
const customStyles = `
  .input-base { ${baseInputStyle.replace(/"/g, '')} }
  .btn-secondary { ${baseBtnSecondaryStyle.replace(/"/g, '')} }
`;

// A simple way to inject styles without a CSS file.
const StyleInjector: React.FC = () => <style>{customStyles}</style>;

// You'd ideally render <StyleInjector /> once in your App.tsx, but for component encapsulation, this shows how to define reusable styles.
// For this project, we will use Tailwind utility classes directly instead.
// The classes "input-base" and "btn-secondary" are just for demonstration, direct Tailwind classes are used above.