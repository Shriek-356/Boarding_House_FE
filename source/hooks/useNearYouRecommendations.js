import { useEffect, useState } from 'react';
import { toModalArea } from '../utils/formatAreaLabel';
import { getRecommendedBoardingZones } from '../api/boardingZoneApi';
import { getAdminAreaSafe } from '../utils/LocationHelper';
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
        const FALLBACK = { district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' };

        const location = await getAdminAreaSafe({
          restrictToVN: true,
          fallbackArea: FALLBACK,
          // Bật dòng dưới khi dev/emulator (đỡ set location thủ công):
          //devOverride: __DEV__ ? FALLBACK : undefined,
        });
        if (!isMounted) return;

        const modalArea = toModalArea({ district: location.district, province: location.province });
        setArea(modalArea);
        const recs = await getRecommendedBoardingZones(
          modalArea.province,
          modalArea.district,
          limit
        );
        console.log(recs);
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