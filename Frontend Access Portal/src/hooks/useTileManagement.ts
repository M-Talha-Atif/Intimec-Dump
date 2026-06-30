"use client";

import { useState, useCallback, useEffect } from 'react';
import { CategoryTileConfig } from '@/types/access-portal';
import {
  mapBackendTileToCategoryTile,
  mapCategoryTileToBackendRequest,
} from '@/mappers/access-portal/tile.mapper';

/**
 * Spring Page response structure from backend
 */
interface SpringPageResponse {
  content: any[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export const useTileManagement = () => {
  const [tiles, setTiles] = useState<CategoryTileConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  /**
   * Fetch tiles from backend with pagination
   */
  const fetchTiles = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTileManagement] Fetching tiles:', { page, size });

      const res = await fetch(`/api/access-portal/tiles?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch tiles: ${res.statusText}`);
      }

      const json = await res.json();
      
      console.log('[useTileManagement] Raw response:', json);

      // Handle Spring Page response structure
      const pageData: SpringPageResponse = json.data;
      
      if (!pageData || !pageData.content) {
        throw new Error('Invalid response format');
      }

      const backendTiles = pageData.content;
      const mappedTiles = backendTiles.map((tile: any, index: number) =>
        mapBackendTileToCategoryTile(tile, index)
      );

      // Map Spring Page fields to our pagination state
      setTiles(mappedTiles);
      setCurrentPage(pageData.number); // Spring uses 'number' for current page
      setPageSize(pageData.size);
      setTotalPages(pageData.totalPages);
      setTotalItems(pageData.totalElements); // Spring uses 'totalElements'
      setHasNext(!pageData.last); // If not last page, has next
      setHasPrevious(!pageData.first); // If not first page, has previous

      console.log('[useTileManagement] Pagination state:', {
        currentPage: pageData.number,
        totalPages: pageData.totalPages,
        totalItems: pageData.totalElements,
        hasNext: !pageData.last,
        hasPrevious: !pageData.first,
        numberOfElements: pageData.numberOfElements,
      });

    } catch (err) {
      console.error('Tile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load initial tiles
   */
  useEffect(() => {
    fetchTiles(currentPage, pageSize);
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchTiles(page, pageSize);
  }, [pageSize, fetchTiles]);

  /**
   * Change page size
   */
  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page
    fetchTiles(0, size);
  }, [fetchTiles]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (hasNext) {
      const nextPageNum = currentPage + 1;
      goToPage(nextPageNum);
    }
  }, [hasNext, currentPage, goToPage]);

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    if (hasPrevious) {
      const prevPageNum = currentPage - 1;
      goToPage(prevPageNum);
    }
  }, [hasPrevious, currentPage, goToPage]);

  /**
   * Create new tile
   */
  const addTile = useCallback(
    async (tileData: Partial<CategoryTileConfig>) => {
      try {
        setError(null);
        setIsCreating(true);

        const backendPayload = mapCategoryTileToBackendRequest(tileData);

        const res = await fetch('/api/access-portal/tiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': 'default-tenant',
          },
          body: JSON.stringify(backendPayload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create tile');
        }

        // Refresh current page
        await fetchTiles(currentPage, pageSize);
      } catch (err) {
        console.error('Tile creation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create tile');
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [currentPage, pageSize, fetchTiles]
  );

  /**
   * Update existing tile
   */
  const updateTile = useCallback(
    async (id: string, tileData: Partial<CategoryTileConfig>) => {
      try {
        setError(null);
        setIsUpdating(true);

        const backendPayload = mapCategoryTileToBackendRequest(tileData);

        const res = await fetch(`/api/access-portal/tiles/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendPayload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update tile');
        }

        // Refresh current page
        await fetchTiles(currentPage, pageSize);
      } catch (err) {
        console.error('Tile update error:', err);
        setError(err instanceof Error ? err.message : 'Failed to update tile');
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [currentPage, pageSize, fetchTiles]
  );

  /**
   * Delete tile
   */
  const deleteTile = useCallback(
    async (id: string) => {
      try {
        setError(null);
        setIsDeleting(true);

        const res = await fetch(`/api/access-portal/tiles/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete tile');
        }

        // If we deleted the last item on the page and it's not the first page, go back one page
        if (tiles.length === 1 && currentPage > 0) {
          await fetchTiles(currentPage - 1, pageSize);
        } else {
          await fetchTiles(currentPage, pageSize);
        }
      } catch (err) {
        console.error('Tile deletion error:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete tile');
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [currentPage, pageSize, tiles.length, fetchTiles]
  );

  /**
   * Fetch single tile by ID
   */
  const fetchTileById = useCallback(async (id: string): Promise<CategoryTileConfig | null> => {
    try {
      setError(null);

      const res = await fetch(`/api/access-portal/tiles/${id}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch tile: ${res.statusText}`);
      }

      const json = await res.json();
      return mapBackendTileToCategoryTile(json.data, 0);
    } catch (err) {
      console.error('Tile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tile');
      return null;
    }
  }, []);

  /**
   * Reorder tiles (frontend only for now)
   */
  const reorderTiles = useCallback((reordered: CategoryTileConfig[]) => {
    setTiles(reordered.map((t, i) => ({ ...t, order: i + 1 })));
  }, []);

  return {
    tiles,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    hasNext,
    hasPrevious,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    
    // CRUD operations
    refetch: () => fetchTiles(currentPage, pageSize),
    addTile,
    updateTile,
    deleteTile,
    fetchTileById,
    reorderTiles,
  };
};