'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import WaitlistForm from './WaitlistForm';
import TasksPanel from './TasksPanel';
import ReferralPanel from './ReferralPanel';
import styles from './WaitlistExperience.module.css';

type WaitlistStats = {
    wallet: string;
    twitter: string;
    referral_code: string;
    referrals_count: number;
    referral_bonus_entries: number;
    task_claims: Record<string, string>;
    task_bonus_entries: number;
    total_entries: number;
};

export default function WaitlistExperience() {
    const searchParams = useSearchParams();
    const [stats, setStats] = useState<WaitlistStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const referredBy = useMemo(() => {
        const code = searchParams.get('ref');
        return code ? code.trim() : null;
    }, [searchParams]);

    const fetchMe = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/waitlist/me');
            const data = await response.json();

            if (response.ok && data.ok) {
                setStats(data.data);
            } else {
                setStats(null);
            }
        } catch (err) {
            setError('Unable to load your waitlist status.');
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    if (loading && !stats) {
        return (
            <div className={styles.loadingCard}>
                <p>Loading your waitlist status...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={styles.formWrapper}>
                {error && <p className={styles.errorBanner}>{error}</p>}
                <WaitlistForm referredBy={referredBy} onSuccess={fetchMe} />
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h2>You're in. Boost your odds with extra entries.</h2>
                <p>
                    Total Entries: <strong>{stats.total_entries}</strong>
                </p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span>Total Entries</span>
                    <strong>{stats.total_entries}</strong>
                </div>
                <div className={styles.statCard}>
                    <span>Task Bonus</span>
                    <strong>{stats.task_bonus_entries}</strong>
                </div>
                <div className={styles.statCard}>
                    <span>Referrals</span>
                    <strong>{stats.referrals_count}</strong>
                </div>
                <div className={styles.statCard}>
                    <span>Referral Bonus</span>
                    <strong>{stats.referral_bonus_entries}</strong>
                </div>
            </div>

            <TasksPanel stats={stats} onClaimed={setStats} />
            <ReferralPanel referralCode={stats.referral_code} stats={stats} />
        </div>
    );
}
