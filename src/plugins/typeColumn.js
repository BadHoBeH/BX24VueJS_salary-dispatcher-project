export const typeBase = {
  N: 'number', // number
  datetime: 'datetime', // date time crm
  date: 'date', // date time crm
  crm_category: 'crm_category',
  money: 'number',
  boolean: 'multiple',
  double: 'number',
  'S:Date': 'date', // date crm
  'S:DateTime': 'datetime', // date crm
  'S:Money': 'number', // money crm
};

export function getTypeFormat(type) {
  return typeBase[type] || null;
}

export default {
  getTypeFormat,
};
