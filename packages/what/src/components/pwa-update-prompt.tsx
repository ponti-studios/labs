import { useRegisterSW } from "virtual:pwa-register/react";

import styles from "./pwa-update-prompt.module.css";

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <aside className={styles.prompt} role="status" aria-live="polite">
      <p className={styles.message}>A fresh version of WH?T is ready.</p>
      <div className={styles.actions}>
        <button
          className={styles.update}
          onClick={() => void updateServiceWorker(true)}
          type="button"
        >
          Update
        </button>
        <button
          className={styles.dismiss}
          onClick={() => setNeedRefresh(false)}
          type="button"
        >
          Later
        </button>
      </div>
    </aside>
  );
}
