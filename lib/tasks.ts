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
        id: 'like-2006473769616027772',
        title: 'Like tweet 22006473769616027772',
        entries: 1,
        intent: 'like',
        tweetId: '2006473769616027772',
    },
    {
        id: 'retweet-2006473769616027772',
        title: 'Retweet tweet 2006473769616027772',
        entries: 2,
        intent: 'retweet',
        tweetId: '2006473769616027772',
    },
    {
        id: 'like-2006367435209990592',
        title: 'Like tweet 2006367435209990592',
        entries: 1,
        intent: 'like',
        tweetId: '2006367435209990592',
    },
];
