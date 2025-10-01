export interface SearchSettings {
    keywords: string;
    searchMethods: {
        keyword: boolean;
        channel: boolean;
        tags: boolean;
        channelKeywords: boolean;
    };
    countries: string[];
    includeUnknown: boolean;
    filters: {
        subs: { min: string; max: string };
        views: { min: string; max:string };
        videos: { min: string; max: string };
        age: { min: string; max: string };
        publishedAfter: string;
    };
    maxResultsPerKeyword: number;
    sortBy: keyof Channel | '';
    sortOrder: 'asc' | 'desc';
}

export interface Channel {
    id: string;
    name: string;
    subscribers: number;
    videos: number;
    views: number;
    avgViews: number;
    country: string;
    age: number; // in days
    publishedAt: string;
    method: string;
    keywords: string[];
    channelKeywords?: string[];
    url: string;
}

export interface ProgressState {
    current: number;
    total: number;
    message: string;
}