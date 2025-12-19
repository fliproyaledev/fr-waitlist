export type TaskDefinition = {
    id: string;
    title: string;
    entries: number;
    intent: 'follow' | 'tweet' | 'like' | 'retweet';
    tweetId?: string;
};

export const TASKS: TaskDefinition[] = [
    {
        id: 'follow',
        title: 'Follow @fliproyale',
        entries: 1,
        intent: 'follow',
    },
    {
        id: 'intent-tweet',
        title: 'Post the intent tweet',
        entries: 2,
        intent: 'tweet',
    },
    {
        id: 'like-1995994265315406127',
        title: 'Like tweet 1995994265315406127',
        entries: 1,
        intent: 'like',
        tweetId: '1995994265315406127',
    },
    {
        id: 'retweet-1991999830911320492',
        title: 'Retweet tweet 1991999830911320492',
        entries: 2,
        intent: 'retweet',
        tweetId: '1991999830911320492',
    },
    {
        id: 'like-2000706974179074490',
        title: 'Like tweet 2000706974179074490',
        entries: 1,
        intent: 'like',
        tweetId: '2000706974179074490',
    },
];
