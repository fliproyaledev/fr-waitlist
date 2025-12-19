'use client';

import { useMemo, useState } from 'react';
import styles from './WaitlistExperience.module.css';

type ReferralPanelProps = {
    referralCode: string;
    stats: {
        referrals_count: number;
        referral_bonus_entries: number;
    };
};

export default function ReferralPanel({ referralCode, stats }: ReferralPanelProps) {
    const [copied, setCopied] = useState(false);

    const referralLink = useMemo(() => {
        if (typeof window === 'undefined') {
            return '';
        }
        return `${window.location.origin}/?ref=${referralCode}`;
    }, [referralCode]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            setCopied(false);
        }
    };

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <h3>Referral link</h3>
                <p>Share your link to earn +2 entries per referral.</p>
            </div>
            <div className={styles.referralRow}>
                <input className={styles.referralInput} value={referralLink} readOnly />
                <button type="button" className={styles.secondaryButton} onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <div className={styles.referralStats}>
                <div>
                    <span>Referrals</span>
                    <strong>{stats.referrals_count}</strong>
                </div>
                <div>
                    <span>Referral Bonus</span>
                    <strong>{stats.referral_bonus_entries}</strong>
                </div>
            </div>
        </section>
    );
}
