
// lib/token.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function refreshToken(): Promise<string> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            // 1. Try to get token from LocalStorage (if used)
            let refresh = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;

            // 2. Try to get token from JS-readable cookies
            if (!refresh && typeof document !== 'undefined') {
                const match = document.cookie.match(new RegExp('(^| )refreshToken=([^;]+)'));
                if (match) refresh = match[2];

                const matchApp = document.cookie.match(new RegExp('(^| )app-refresh-token=([^;]+)'));
                if (matchApp) refresh = matchApp[2];
            }

            // 3. Request Refresh
            const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(refresh ? { refresh } : {}),
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Token konnte nicht erneuert werden');
            }

            const data = await res.json();

            // 4. Update Tokens
            if (typeof localStorage !== 'undefined') {
                if (data.access) localStorage.setItem('accessToken', data.access);
                if (data.refresh) localStorage.setItem('refreshToken', data.refresh);

                // Reset Expiry
                const expiryDate = new Date().getTime() + 2 * 60 * 60 * 1000;
                localStorage.setItem('sessionExpiry', expiryDate.toString());
            }

            // 5. Update Cookies
            if (typeof document !== 'undefined' && data.access) {
                document.cookie = `accessToken=${data.access}; path=/; max-age=7200`;
                if (data.refresh) {
                    document.cookie = `refreshToken=${data.refresh}; path=/; max-age=7200`;
                }
            }

            return data.access;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}
