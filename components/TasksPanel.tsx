'use client';

import { useMemo, useState } from 'react';
import { TASKS } from '@/lib/tasks';
import styles from './WaitlistExperience.module.css';

type WaitlistStats = {
    wallet: string;
    twitter: string;
    referral_code: string;
    task_claims: Record<string, string>;
    task_bonus_entries: number;
    total_entries: number;
    referrals_count: number;
    referral_bonus_entries: number;
};

type TasksPanelProps = {
    stats: WaitlistStats;
    onClaimed: (stats: WaitlistStats) => void;
};

const buildIntentUrl = (taskId: string, referralLink: string, origin: string) => {
    if (taskId === 'follow') {
        return 'https://twitter.com/intent/follow?screen_name=fliproyale';
    }

    if (taskId === 'intent-tweet') {
        const imageUrl = origin ? `${origin}/images/hero-character.jpg` : '';
        const text = `I just joined Flip Royale on Virtual Protocol. @fliproyale Join the waitlist with my link: ${referralLink} ${imageUrl}`.trim();
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    }

    const task = TASKS.find((item) => item.id === taskId);
    if (task?.intent === 'like' && task.tweetId) {
        return `https://twitter.com/intent/like?tweet_id=${task.tweetId}`;
    }

    if (task?.intent === 'retweet' && task.tweetId) {
        return `https://twitter.com/intent/retweet?tweet_id=${task.tweetId}`;
    }

    return 'https://twitter.com/fliproyale';
};

export default function TasksPanel({ stats, onClaimed }: TasksPanelProps) {
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [openedTasks, setOpenedTasks] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const referralLink = useMemo(() => {
        if (typeof window === 'undefined') {
            return '';
        }
        return `${window.location.origin}/?ref=${stats.referral_code}`;
    }, [stats.referral_code]);

    const handleOpen = (taskId: string) => {
        setOpenedTasks((prev) => ({ ...prev, [taskId]: true }));
    };

    const handleClaim = async (taskId: string) => {
        setError(null);
        setClaimingId(taskId);

        try {
            const response = await fetch('/api/waitlist/task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId }),
            });
            const data = await response.json();
            if (response.ok && data.ok) {
                onClaimed(data.data);
            } else {
                setError(data.error || 'Unable to claim task.');
            }
        } catch (err) {
            setError('Unable to claim task.');
        } finally {
            setClaimingId(null);
        }
    };

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <h3>Boost your entries</h3>
                <p>Complete tasks to earn extra entries.</p>
            </div>
            {error && <p className={styles.errorBanner}>{error}</p>}
            <div className={styles.taskList}>
                {TASKS.map((task) => {
                    const claimed = Boolean(stats.task_claims?.[task.id]);
                    const intentUrl = buildIntentUrl(task.id, referralLink, origin);
                    const canClaim = openedTasks[task.id] || claimed;

                    return (
                        <div key={task.id} className={styles.taskCard}>
                            <div>
                                <h4>{task.title}</h4>
                                <p className={styles.taskReward}>+{task.entries} entries</p>
                            </div>
                            <div className={styles.taskActions}>
                                <a
                                    href={intentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.secondaryButton}
                                    onClick={() => handleOpen(task.id)}
                                >
                                    Open on X
                                </a>
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => handleClaim(task.id)}
                                    disabled={claimed || claimingId === task.id || !canClaim}
                                >
                                    {claimed ? 'Claimed' : claimingId === task.id ? 'Claiming...' : 'Claim'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
