import { useEffect, useState, useCallback } from 'react';
import { getUserAdminArea } from '../utils/LocationHelper';
import { getRecommendedBoardingZones } from '../api/boardingZoneApi';

export function useNearYouRecommendations(limit = 8, fallbackArea) {
  const [data, setData] = useState([]);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { district, province } = await getUserAdminArea();
      setArea({ district, province });
      const recs = await getRecommendedBoardingZones({ district, province, limit });
      setData(recs);
    } catch (e) {
      setErr(e);
      if (fallbackArea?.district && fallbackArea?.province) {
        const recs = await getRecommendedBoardingZones({
          district: fallbackArea.district,
          province: fallbackArea.province,
          limit,
        });
        setArea(fallbackArea);
        setData(recs);
      }
    } finally {
      setLoading(false);
    }
  }, [limit, fallbackArea]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error: err, area, reload: load };
}