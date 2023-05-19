import {useEffect, useRef} from 'react';

export const usePrev = (status: any) => {
  const ref = useRef<any>();
  useEffect(() => {
    ref.current = status;
  });
  return ref.current;
};
