import 'server-only';

import type { Redis } from '@upstash/redis';
import crypto from 'crypto';

import { TASKS } from './tasks';

export type WaitlistUser = {
    id: string;
    wallet: string;
    twitter: string;
    referral_code: string;
    referred_by?: string;
    referrals_count: number;
    referral_bonus_entries: number;
    task_claims: Record<string, string>;
    task_bonus_entries: number;
    base_entries: number;
};

export type WaitlistStats = {
    wallet: string;
    twitter: string;
    referral_code: string;
    referrals_count: number;
    referral_bonus_entries: number;
    task_claims: Record<string, string>;
    task_bonus_entries: number;
    total_entries: number;
};

let redisClient: Redis | null = null;

const getRedisClient = async () => {
    if (redisClient) {
        return redisClient;
    }

    const { Redis } = await import('@upstash/redis');
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error('Upstash Redis credentials are not configured');
    }

    redisClient = new Redis({ url, token });
    return redisClient;
};

const userKey = (userId: string) => `waitlist:user:${userId}`;
const walletKey = (wallet: string) => `waitlist:wallet:${wallet}`;
const twitterKey = (twitter: string) => `waitlist:twitter:${twitter}`;
const referralCodeKey = (code: string) => `waitlist:refcode:${code}`;
const sessionKey = (token: string) => `waitlist:session:${token}`;
const referralEdgeKey = (referrerId: string, userId: string) =>
    `waitlist:ref:${referrerId}:${userId}`;

const parseJson = <T>(value: unknown): T | null => {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    return value as T;
};

const serialize = (value: unknown) => JSON.stringify(value);

export const normalizeTwitter = (value: string) => value.trim().replace(/^@/, '').toLowerCase();

export const normalizeWallet = (value: string) => value.trim().toLowerCase();

const generateReferralCode = async () => {
    const redis = await getRedisClient();

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = crypto.randomBytes(5).toString('base64url');
        const existing = await redis.get(referralCodeKey(code));
        if (!existing) {
            return code;
        }
    }

    return crypto.randomUUID().replace(/-/g, '').slice(0, 10);
};

const getUserById = async (userId: string) => {
    const redis = await getRedisClient();
    const data = await redis.get(userKey(userId));
    return parseJson<WaitlistUser>(data);
};

const saveUser = async (user: WaitlistUser) => {
    const redis = await getRedisClient();
    await redis.set(userKey(user.id), serialize(user));
    await redis.set(walletKey(user.wallet), user.id);
    await redis.set(twitterKey(user.twitter), user.id);
    await redis.set(referralCodeKey(user.referral_code), user.id);
};

const ensureReferralCode = async (user: WaitlistUser) => {
    if (user.referral_code) {
        return user;
    }

    user.referral_code = await generateReferralCode();
    await saveUser(user);
    return user;
};

export const upsertUser = async (wallet: string, twitter: string) => {
    const redis = await getRedisClient();
    const walletId = await redis.get(walletKey(wallet));
    const twitterId = await redis.get(twitterKey(twitter));
    const userId = (walletId || twitterId) as string | undefined;

    if (userId) {
        const existing = await getUserById(userId);
        if (!existing) {
            throw new Error('Existing user record missing');
        }

        existing.wallet = wallet;
        existing.twitter = twitter;
        await ensureReferralCode(existing);
        await saveUser(existing);
        return { user: existing, created: false };
    }

    const newUser: WaitlistUser = {
        id: crypto.randomUUID(),
        wallet,
        twitter,
        referral_code: await generateReferralCode(),
        referrals_count: 0,
        referral_bonus_entries: 0,
        task_claims: {},
        task_bonus_entries: 0,
        base_entries: 1,
    };

    await saveUser(newUser);
    return { user: newUser, created: true };
};

export const createSession = async (userId: string) => {
    const token = crypto.randomUUID();
    const redis = await getRedisClient();
    await redis.set(sessionKey(token), userId, { ex: 60 * 60 * 24 * 30 });
    return token;
};

export const getUserBySession = async (token: string) => {
    if (!token) {
        return null;
    }

    const redis = await getRedisClient();
    const userId = await redis.get(sessionKey(token));
    if (!userId || typeof userId !== 'string') {
        return null;
    }

    return getUserById(userId);
};

export const applyReferral = async ({
    user,
    referredBy,
}: {
    user: WaitlistUser;
    referredBy?: string | null;
}) => {
    if (!referredBy || user.referred_by) {
        return;
    }

    const redis = await getRedisClient();
    const referrerId = await redis.get(referralCodeKey(referredBy));
    if (!referrerId || typeof referrerId !== 'string') {
        return;
    }

    if (referrerId === user.id) {
        return;
    }

    const edgeKey = referralEdgeKey(referrerId, user.id);
    const alreadyCredited = await redis.get(edgeKey);
    if (alreadyCredited) {
        return;
    }

    const referrer = await getUserById(referrerId);
    if (!referrer) {
        return;
    }

    referrer.referrals_count += 1;
    referrer.referral_bonus_entries += 2;
    await saveUser(referrer);

    user.referred_by = referrerId;
    await saveUser(user);
    await redis.set(edgeKey, '1');
};

const computeTaskBonus = (taskClaims: Record<string, string>) =>
    TASKS.reduce((total, task) => (taskClaims[task.id] ? total + task.entries : total), 0);

export const buildStats = (user: WaitlistUser): WaitlistStats => {
    const task_bonus_entries = computeTaskBonus(user.task_claims);
    const total_entries = user.base_entries + task_bonus_entries + user.referral_bonus_entries;

    return {
        wallet: user.wallet,
        twitter: user.twitter,
        referral_code: user.referral_code,
        referrals_count: user.referrals_count,
        referral_bonus_entries: user.referral_bonus_entries,
        task_claims: user.task_claims,
        task_bonus_entries,
        total_entries,
    };
};

export const claimTask = async (user: WaitlistUser, taskId: string) => {
    if (!TASKS.find((task) => task.id === taskId)) {
        throw new Error('Unknown task.');
    }

    if (user.task_claims[taskId]) {
        return user;
    }

    user.task_claims[taskId] = new Date().toISOString();
    user.task_bonus_entries = computeTaskBonus(user.task_claims);
    await saveUser(user);
    return user;
};
