'use client';

// Client-side automatic token refresh functionality
// This handles the automatic refresh timers that can't run in Server Actions

import { _refreshToken, _getTokenStatus } from './auth';

// Automatic refresh timer management
let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Schedules automatic token refresh at 90% of token lifetime (10% before expiration)
 */
async function scheduleAutoRefresh(): Promise<void> {
    // Clear any existing timer
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }

    try {
        const status = await _getTokenStatus();
        
        // Only schedule if token is valid and not expired
        if (!status.isValid || status.isExpired || !status.expiresAt) {
            return;
        }

        const now = Date.now();
        const timeUntilExpiration = status.expiresAt - now;
        
        // Calculate refresh time: 90% of token lifetime (10% before expiration)
        const refreshTime = timeUntilExpiration * 0.9;
        
        // Minimum 30 seconds, maximum based on token lifetime
        const safeRefreshTime = Math.max(refreshTime, 30000);
        
        refreshTimer = setTimeout(async () => {
            
            // Check if we should still refresh (user might have logged out)
            const currentStatus = await _getTokenStatus();
            if (!currentStatus.isValid || currentStatus.isExpired) {
                refreshTimer = null;
                return;
            }
            
            const refreshResult = await _refreshToken();
            
            if (refreshResult.success) {
                // Schedule the next refresh for the new token
                await scheduleAutoRefresh();
            } else {
                refreshTimer = null;
            }
        }, safeRefreshTime);
        
    } catch (error) {
    }
}

/**
 * Starts automatic token refresh monitoring
 */
export async function startAutoRefresh(): Promise<void> {
    await scheduleAutoRefresh();
}

/**
 * Stops automatic token refresh
 */
export function stopAutoRefresh(): void {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
}

/**
 * Restarts auto-refresh (useful after manual refresh)
 */
export async function restartAutoRefresh(): Promise<void> {
    stopAutoRefresh();
    await startAutoRefresh();
}