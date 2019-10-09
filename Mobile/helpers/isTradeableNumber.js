export default (value) => {
  if (value == undefined || value == '' || value == 0) return false;
  value = value.replace(/,/g, ".");
  if (isNaN(value)) return false;
  return value;
}