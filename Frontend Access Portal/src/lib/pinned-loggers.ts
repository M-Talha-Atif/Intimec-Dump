"use client";

import { _getAuthToken } from "./auth";


// Interface for the new API request/response structure
export interface PinnedLogRequest {
    logId: string;
    name: string;
    description: string;
    data: {
        id: string;
        level: string;
        source: string;
        message: string;
        category: string;
        timestamp: string;
        aiExplanation?: string;
        objectType?: string;
        objectId?: string;
        correlationId?: string;
        retryable?: boolean;
        suggestedFix?: string;
        details?: any;
    };
}

export interface PinnedLogResponse {
    id: string;
    logId: string;
    name: string;
    description: string;
    data: {
        id: string;
        level: string;
        source: string;
        message: string;
        category: string;
        timestamp: string;
        aiExplanation?: string;
        objectType?: string;
        objectId?: string;
        correlationId?: string;
        retryable?: boolean;
        suggestedFix?: string;
        details?: any;
    };
    createdAt: string;
    updatedAt: string;
}

// Get all pinned loggers
export const getPinnedLoggers = async (): Promise<PinnedLogResponse[]> => {
    const token = await _getAuthToken();

    const response = await fetch(`/api/pinned-loggers`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch pinned loggers: ${response.status}`);
    }

    return response.json();
};

// Create a new pinned logger
export const createPinnedLogger = async (request: PinnedLogRequest): Promise<PinnedLogResponse> => {
    const token = await _getAuthToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/pinned-loggers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create pinned logger: ${response.status}`);
    }

    return response.json();
};

// Delete a pinned logger
export const deletePinnedLogger = async (id: string): Promise<void> => {
    const token = await _getAuthToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/pinned-loggers/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete pinned logger: ${response.status}`);
    }
};

