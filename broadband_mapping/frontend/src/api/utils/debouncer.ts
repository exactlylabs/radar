import {ChangeEventHandler} from "react";

export const debounce = (func: Function, delay: number = 300): ChangeEventHandler => {
  let timer: NodeJS.Timeout | string | number | undefined;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  }
}