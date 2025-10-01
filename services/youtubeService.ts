import type { Channel, SearchSettings, ProgressState } from '../types';
import { parseNumber, getPublishedAfterDate } from '../utils/utils';

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export class ApiKeyManager {
    private keys: string[];
    private currentIndex: number;

    constructor(apiKeys: string[]) {
        this.keys = apiKeys;
        this.currentIndex = 0;
    }

    public getKey(): string {
        if (this.keys.length === 0) {
            throw new Error('No API keys provided.');
        }
        return this.keys[this.currentIndex];
    }
    
    public getKeyCount(): number {
        return this.keys.length;
    }

    public rotateKey(): string {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        if (this.currentIndex === 0) {
            throw new Error('All API keys have been exhausted.');
        }
        return this.getKey();
    }
    
    private async apiCall<T,>(endpoint: string, params: Record<string, string | number>): Promise<T> {
        let attempts = 0;
        while (attempts < this.keys.length) {
            const key = this.getKey();
            const url = new URL(`${API_BASE_URL}/${endpoint}`);
            url.searchParams.set('key', key);
            for (const p in params) {
                url.searchParams.set(p, String(params[p]));
            }
            
            try {
                const response = await fetch(url.toString());
                if (response.status === 403) { // Quota exceeded
                    console.warn(`API key ${key.substring(0, 5)}... has likely exceeded its quota. Rotating.`);
                    this.rotateKey();
                    attempts++;
                    continue;
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error.message || `API call failed with status ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                 if (error instanceof Error && error.message.includes('All API keys')) {
                    throw error;
                 }
                 console.error(`API call failed for key ${key.substring(0, 5)}...`, error);
                 this.rotateKey();
                 attempts++;
            }
        }
        throw new Error('All API keys failed or are exhausted.');
    }
    
    public async startSearch(
        settings: SearchSettings,
        setProgress: React.Dispatch<React.SetStateAction<ProgressState>>,
        onResultsBatch: (channels: Channel[]) => void
    ) {
        const keywords = settings.keywords.split(',').map(k => k.trim()).filter(Boolean);
        if (keywords.length === 0) throw new Error("No keywords provided.");
        
        const totalSteps = keywords.length * settings.countries.length;
        let currentStep = 0;

        const allChannelIds = new Map<string, { method: string, keyword: string }>();

        for (const keyword of keywords) {
            for (const country of settings.countries) {
                currentStep++;
                setProgress({ current: currentStep, total: totalSteps, message: `Searching "${keyword}" in ${country}...` });

                let foundIds = new Map<string, string>();

                if (settings.searchMethods.keyword || settings.searchMethods.tags) {
                     const videoSearchIds = await this.searchVideos(keyword, country, settings);
                     videoSearchIds.forEach(id => foundIds.set(id, settings.searchMethods.keyword ? 'Keyword' : 'Tags'));
                }
                if (settings.searchMethods.channel) {
                     const channelSearchIds = await this.searchChannels(keyword, country, settings);
                     channelSearchIds.forEach(id => foundIds.set(id, 'Channel Desc'));
                }
                if (settings.searchMethods.channelKeywords) {
                    const channelKeywordIds = await this.findChannelsByKeywordsSetting(keyword, country, settings);
                    channelKeywordIds.forEach(id => foundIds.set(id, 'Channel Keywords'));
                }

                foundIds.forEach((method, id) => {
                    if (!allChannelIds.has(id)) {
                        allChannelIds.set(id, { method, keyword });
                    } else {
                        const existing = allChannelIds.get(id)!;
                        if (!existing.keyword.includes(keyword)) {
                           existing.keyword += `, ${keyword}`;
                        }
                    }
                });
            }
        }

        setProgress({ current: 0, total: allChannelIds.size, message: `Found ${allChannelIds.size} unique channels. Fetching details...` });

        const uniqueChannelIds = Array.from(allChannelIds.keys());
        const batches = [];
        for (let i = 0; i < uniqueChannelIds.length; i += 50) {
            batches.push(uniqueChannelIds.slice(i, i + 50));
        }

        let processedCount = 0;
        for (const batch of batches) {
            const details = await this.getChannelDetails(batch);
            const filteredChannels = this.filterChannels(details, settings.filters).map(ch => {
                const info = allChannelIds.get(ch.id)!;
                return { ...ch, method: info.method, keywords: [info.keyword] };
            });

            onResultsBatch(filteredChannels);
            processedCount += batch.length;
            setProgress({ current: processedCount, total: allChannelIds.size, message: `Processing channels... ${processedCount}/${allChannelIds.size}` });
        }
    }
    
    private async searchVideos(keyword: string, country: string, settings: SearchSettings): Promise<string[]> {
        const channelIds = new Set<string>();
        let nextPageToken: string | undefined = undefined;
        const pagesToFetch = Math.ceil(settings.maxResultsPerKeyword / 50);

        for (let i = 0; i < pagesToFetch; i++) {
            const params: any = {
                part: 'snippet',
                q: keyword,
                type: 'video',
                maxResults: 50,
                regionCode: country,
            };
            if (nextPageToken) params.pageToken = nextPageToken;
            if (settings.filters.publishedAfter) params.publishedAfter = getPublishedAfterDate(settings.filters.publishedAfter);

            const data = await this.apiCall<any>('search', params);
            data.items.forEach((item: any) => channelIds.add(item.snippet.channelId));
            nextPageToken = data.nextPageToken;
            if (!nextPageToken) break;
        }
        return Array.from(channelIds);
    }
    
    private async searchChannels(keyword: string, country: string, settings: SearchSettings): Promise<string[]> {
        const params: any = {
            part: 'snippet',
            q: keyword,
            type: 'channel',
            maxResults: 50,
            regionCode: country,
        };
        const data = await this.apiCall<any>('search', params);
        return data.items.map((item: any) => item.snippet.channelId);
    }

    private async findChannelsByKeywordsSetting(keyword: string, country: string, settings: SearchSettings): Promise<string[]> {
        const candidateIds = await this.searchChannels(keyword, country, settings);
        if (candidateIds.length === 0) return [];

        const channelDetails = await this.getChannelDetails(candidateIds);
        
        const searchKeyword = keyword.toLowerCase();
        const matchingChannels = channelDetails.filter(channel => 
            channel.channelKeywords?.some(chKeyword => chKeyword.toLowerCase().includes(searchKeyword))
        );

        return matchingChannels.map(ch => ch.id);
    }

    private async getChannelDetails(channelIds: string[]): Promise<Channel[]> {
        if(channelIds.length === 0) return [];
        const params = {
            part: 'snippet,statistics,brandingSettings',
            id: channelIds.join(','),
            maxResults: 50
        };
        const data = await this.apiCall<any>('channels', params);
        
        return data.items?.map((item: any) => {
            const subs = parseInt(item.statistics.subscriberCount || '0', 10);
            const videos = parseInt(item.statistics.videoCount || '0', 10);
            const views = parseInt(item.statistics.viewCount || '0', 10);
            const publishedAt = item.snippet.publishedAt;
            const age = (new Date().getTime() - new Date(publishedAt).getTime()) / (1000 * 3600 * 24);
            const channelKeywordsRaw = item.brandingSettings?.channel?.keywords;
            
            return {
                id: item.id,
                name: item.snippet.title,
                subscribers: subs,
                videos: videos,
                views: views,
                avgViews: videos > 0 ? Math.round(views / videos) : 0,
                country: item.snippet.country || 'Unknown',
                age: Math.round(age),
                publishedAt: publishedAt,
                url: `https://www.youtube.com/channel/${item.id}`,
                method: '',
                keywords: [],
                channelKeywords: channelKeywordsRaw ? channelKeywordsRaw.split(/\s*,\s*|\s+/).filter(Boolean) : [],
            };
        }) || [];
    }

    private filterChannels(channels: Channel[], filters: SearchSettings['filters']): Channel[] {
        return channels.filter(c => {
            const minSubs = parseNumber(filters.subs.min);
            const maxSubs = parseNumber(filters.subs.max);
            const minViews = parseNumber(filters.views.min);
            const maxViews = parseNumber(filters.views.max);
            const minVideos = parseNumber(filters.videos.min);
            const maxVideos = parseNumber(filters.videos.max);
            const minAge = parseNumber(filters.age.min);
            const maxAge = parseNumber(filters.age.max);

            if (minSubs && c.subscribers < minSubs) return false;
            if (maxSubs && c.subscribers > maxSubs) return false;
            if (minViews && c.views < minViews) return false;
            if (maxViews && c.views > maxViews) return false;
            if (minVideos && c.videos < minVideos) return false;
            if (maxVideos && c.videos > maxVideos) return false;
            if (minAge && c.age < minAge) return false;
            if (maxAge && c.age > maxAge) return false;

            return true;
        });
    }
}