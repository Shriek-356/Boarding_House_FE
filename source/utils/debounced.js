import { useState } from "react";
import { useEffect } from "react";
export const useDebounced = (value, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t); // user gõ tiếp thì hủy lần trước
  }, [value, delay]);
  return v;
}