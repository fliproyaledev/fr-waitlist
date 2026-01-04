import styles from './page.module.css';
import Image from 'next/image';

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.closedContainer}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Image
            src="/images/logo.jpg"
            alt="Flip Royale Logo"
            width={150}
            height={150}
            priority
            className={styles.logo}
          />
        </div>

        {/* Title */}
        <h1 className={styles.title}>
          <span className={styles.titleGradient}>Flip Royale</span>
        </h1>

        {/* Closed Badge */}
        <div className={styles.closedBadge}>
          <span className={styles.closedIcon}>🔒</span>
          <span className={styles.closedText}>Waitlist Closed</span>
        </div>

        {/* Message */}
        <p className={styles.closedMessage}>
          Thank you for your interest! Our waitlist has officially closed.
          <br />
          Stay tuned for exciting announcements coming soon!
        </p>

        {/* Social Links */}
        <div className={styles.socialLinks}>
          <a
            href="https://x.com/fliproyale"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            Follow us on X for updates
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Flip Royale. Built on Virtual Protocol.</p>
      </footer>
    </div>
  );
}
