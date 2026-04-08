import { useState, useEffect, useCallback } from 'react';
import { fetchRegions, Region } from '@/features/auth/services/regionService';

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState<string | null>(null);

  const loadRegions = useCallback(async () => {
    setRegionsLoading(true);
    setRegionsError(null);
    try {
      const regionsData = await fetchRegions();
      setRegions(regionsData);
    } catch (error) {
      setRegionsError('Failed to load regions. Please try again.');
    } finally {
      setRegionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  return {
    regions,
    regionsLoading,
    regionsError,
    refreshRegions: loadRegions,
  };
}
