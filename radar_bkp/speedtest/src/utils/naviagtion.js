export const getParamsFromObject = (paramObject) => {
  let string = '';
  Object.keys(paramObject).forEach(key => {
    string += `&${key}=${paramObject[key]}`;
  });
  return string;
}