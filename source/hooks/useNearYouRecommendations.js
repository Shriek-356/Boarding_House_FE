import { useEffect, useState } from 'react';
import { getAdminAreaSafe } from '../utils/LocationHelper';
import { getRecommendedBoardingZones } from '../api/boardingZoneApi';

export function useNearYouRecommendations(limit = 8) {
  const [data, setData] = useState([]);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true); setError(null);
      try {
        const FALLBACK = { district: 'Quận 1', province: 'TP. Hồ Chí Minh' };

        const location = await getAdminAreaSafe({
          restrictToVN: true,
          fallbackArea: FALLBACK,
          // Bật dòng dưới khi dev/emulator (đỡ set location thủ công):
          devOverride: __DEV__ ? FALLBACK : undefined,
        });
        if (!isMounted) return;

        setArea({
          district: location.district,
          province: location.province,
          isFallback: !!location.isFallback,
          source: location.source,
          reasonCode: location.reasonCode,
        });

        const recs = await getRecommendedBoardingZones(
          { district: location.district, province: location.province },
          limit
        );
        if (!isMounted) return;
        setData(recs);
      } catch (err) {
        if (!isMounted) return;
        setError(err);
        setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [limit]);

  return { data, loading, error, area };
}