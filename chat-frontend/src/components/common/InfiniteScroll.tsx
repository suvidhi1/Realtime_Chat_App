import React, { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  loader?: React.ReactNode;
  threshold?: number;
  reverse?: boolean;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  loadMore,
  loader,
  threshold = 100,
  reverse = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(async () => {
    if (!containerRef.current || loadingRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    let shouldLoad = false;

    if (reverse) {
      // For reverse scroll (load more at top)
      shouldLoad = scrollTop <= threshold;
    } else {
      // For normal scroll (load more at bottom)
      shouldLoad = scrollTop + clientHeight >= scrollHeight - threshold;
    }

    if (shouldLoad) {
      loadingRef.current = true;
      try {
        await loadMore();
      } catch (error) {
        console.error('Error loading more items:', error);
      } finally {
        loadingRef.current = false;
      }
    }
  }, [hasMore, loadMore, threshold, reverse]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: reverse ? 'column-reverse' : 'column',
      }}
    >
      {reverse && hasMore && loader && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          {loader}
        </Box>
      )}
      
      {children}
      
      {!reverse && hasMore && loader && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          {loader}
        </Box>
      )}
    </Box>
  );
};
