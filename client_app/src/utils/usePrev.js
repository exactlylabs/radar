import { useEffect, useRef } from 'react';

export const usePrev = status => {
  const ref = useRef();
  useEffect(() => {
    ref.current = status;
  });
  return ref.current;
};
