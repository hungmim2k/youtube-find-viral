
import type { Channel } from '../types';

export const parseNumber = (input: string): number | null => {
    if (!input) return null;
    const cleaned = input.toLowerCase().trim();
    const lastChar = cleaned.charAt(cleaned.length - 1);
    let num = parseFloat(cleaned);
    
    if (isNaN(num)) return null;

    switch (lastChar) {
        case 'k':
            num *= 1000;
            break;
        case 'm':
            num *= 1000000;
            break;
        case 'b':
            num *= 1000000000;
            break;
    }
    return Math.round(num);
};

export const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
};

export const getPublishedAfterDate = (filter: string): string => {
    const now = new Date();
    switch (filter) {
        case 'today':
            now.setDate(now.getDate() - 1);
            break;
        case 'week':
            now.setDate(now.getDate() - 7);
            break;
        case 'month':
            now.setMonth(now.getMonth() - 1);
            break;
        case '3months':
            now.setMonth(now.getMonth() - 3);
            break;
        case '6months':
            now.setMonth(now.getMonth() - 6);
            break;
        case 'year':
            now.setFullYear(now.getFullYear() - 1);
            break;
        default:
            return '';
    }
    return now.toISOString();
};


export const exportToCsv = (data: Channel[]) => {
    const header = ['Channel Name', 'Subscribers', 'Videos', 'Total Views', 'Avg Views', 'Country', 'Age (days)', 'URL', 'Keywords', 'Method'].join(',');
    const rows = data.map(c => [
        `"${c.name.replace(/"/g, '""')}"`,
        c.subscribers,
        c.videos,
        c.views,
        c.avgViews,
        c.country,
        c.age,
        c.url,
        `"${c.keywords.join(', ')}"`,
        c.method
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "youtube_channels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToJson = (data: Channel[]) => {
    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", "youtube_channels.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
