export const PLAN_META = {
  GOSPELS_42: { label: "Evangheliile în 42 de zile", days: 42, color: "#c9a96e" },
  NT_42:      { label: "Noul Testament în 42 de zile", days: 42, color: "#7eb8c9" },
  NT_60:      { label: "Noul Testament în 2 luni", days: 60, color: "#9ec97e" },
  BIBLE_180:  { label: "Biblia integrală în 6 luni", days: 180, color: "#c97e9e" },
};

// Evangheliile in 42 de zile
const GOSPELS_42 = [
  "Matei 1-2", "Matei 3-4", "Matei 5-6", "Matei 7-8", "Matei 9-10",
  "Matei 11-12", "Matei 13-14", "Matei 15-16", "Matei 17-18", "Matei 19-20",
  "Matei 21-22", "Matei 23-24", "Matei 25-26", "Matei 27-28",
  "Marcu 1-2", "Marcu 3-4", "Marcu 5-6", "Marcu 7-8", "Marcu 9-10",
  "Marcu 11-12", "Marcu 13-14", "Marcu 15-16",
  "Luca 1-2", "Luca 3-4", "Luca 5-6", "Luca 7-8", "Luca 9-10",
  "Luca 11-12", "Luca 13-14", "Luca 15-16", "Luca 17-18", "Luca 19-20",
  "Luca 21-22", "Luca 23-24",
  "Ioan 1-2", "Ioan 3-4", "Ioan 5-6", "Ioan 7-8", "Ioan 9-10",
  "Ioan 11-12", "Ioan 13-14", "Ioan 15-16-17-18-19-20-21",
];

// NT in 42 de zile (~7 capitole/zi)
const NT_42 = [
  "Matei 1-4", "Matei 5-7", "Matei 8-11", "Matei 12-14", "Matei 15-18",
  "Matei 19-22", "Matei 23-25", "Matei 26-28",
  "Marcu 1-4", "Marcu 5-8", "Marcu 9-12", "Marcu 13-16",
  "Luca 1-3", "Luca 4-6", "Luca 7-9", "Luca 10-12", "Luca 13-15",
  "Luca 16-18", "Luca 19-21", "Luca 22-24",
  "Ioan 1-3", "Ioan 4-6", "Ioan 7-9", "Ioan 10-12", "Ioan 13-15",
  "Ioan 16-18", "Ioan 19-21",
  "Faptele 1-4", "Faptele 5-8", "Faptele 9-12", "Faptele 13-16", "Faptele 17-20", "Faptele 21-24", "Faptele 25-28",
  "Romani 1-5", "Romani 6-11", "Romani 12-16",
  "1 Corinteni 1-8", "1 Corinteni 9-16",
  "2 Corinteni 1-13",
  "Galateni 1-6 + Efeseni 1-6",
];

// NT in 60 de zile (~4 capitole/zi)
const NT_60 = [
  "Matei 1-2", "Matei 3-4", "Matei 5-6", "Matei 7-8", "Matei 9-10",
  "Matei 11-12", "Matei 13-14", "Matei 15-16", "Matei 17-18", "Matei 19-20",
  "Matei 21-22", "Matei 23-24", "Matei 25-26", "Matei 27-28",
  "Marcu 1-2", "Marcu 3-4", "Marcu 5-6", "Marcu 7-8", "Marcu 9-10",
  "Marcu 11-12", "Marcu 13-14", "Marcu 15-16",
  "Luca 1-2", "Luca 3-4", "Luca 5-6", "Luca 7-8", "Luca 9-10",
  "Luca 11-12", "Luca 13-14", "Luca 15-16", "Luca 17-18", "Luca 19-20",
  "Luca 21-22", "Luca 23-24",
  "Ioan 1-2", "Ioan 3-4", "Ioan 5-6", "Ioan 7-8", "Ioan 9-10",
  "Ioan 11-12", "Ioan 13-14", "Ioan 15-16", "Ioan 17-18", "Ioan 19-21",
  "Faptele 1-3", "Faptele 4-6", "Faptele 7-9", "Faptele 10-12",
  "Faptele 13-15", "Faptele 16-18", "Faptele 19-21", "Faptele 22-24", "Faptele 25-28",
  "Romani 1-4", "Romani 5-8", "Romani 9-11", "Romani 12-16",
  "1 Corinteni 1-6", "1 Corinteni 7-11", "1 Corinteni 12-16",
];

// Biblia integrala in 180 de zile (~4 capitole/zi, selectie reprezentativa)
const BIBLE_180_BOOKS = [
  // VT
  "Geneza 1-3","Geneza 4-7","Geneza 8-11","Geneza 12-15","Geneza 16-19","Geneza 20-23","Geneza 24-26","Geneza 27-29","Geneza 30-32","Geneza 33-36",
  "Geneza 37-39","Geneza 40-42","Geneza 43-46","Geneza 47-50",
  "Exodul 1-3","Exodul 4-7","Exodul 8-11","Exodul 12-14","Exodul 15-18","Exodul 19-21","Exodul 22-24","Exodul 25-28","Exodul 29-32","Exodul 33-36","Exodul 37-40",
  "Leviticul 1-5","Leviticul 6-10","Leviticul 11-15","Leviticul 16-20","Leviticul 21-27",
  "Numeri 1-4","Numeri 5-8","Numeri 9-12","Numeri 13-16","Numeri 17-20","Numeri 21-24","Numeri 25-28","Numeri 29-32","Numeri 33-36",
  "Deuteronom 1-4","Deuteronom 5-8","Deuteronom 9-12","Deuteronom 13-16","Deuteronom 17-20","Deuteronom 21-24","Deuteronom 25-28","Deuteronom 29-32","Deuteronom 33-34",
  "Iosua 1-5","Iosua 6-10","Iosua 11-15","Iosua 16-20","Iosua 21-24",
  "Judecători 1-5","Judecători 6-10","Judecători 11-15","Judecători 16-21",
  "Rut 1-4",
  "1 Samuel 1-5","1 Samuel 6-10","1 Samuel 11-15","1 Samuel 16-20","1 Samuel 21-25","1 Samuel 26-31",
  "2 Samuel 1-5","2 Samuel 6-10","2 Samuel 11-15","2 Samuel 16-20","2 Samuel 21-24",
  "1 Împărați 1-5","1 Împărați 6-10","1 Împărați 11-15","1 Împărați 16-20","1 Împărați 21-22",
  "2 Împărați 1-5","2 Împărați 6-10","2 Împărați 11-15","2 Împărați 16-20","2 Împărați 21-25",
  "Psalmii 1-10","Psalmii 11-20","Psalmii 21-30","Psalmii 31-40","Psalmii 41-50",
  "Psalmii 51-60","Psalmii 61-70","Psalmii 71-80","Psalmii 81-90","Psalmii 91-100",
  "Psalmii 101-110","Psalmii 111-120","Psalmii 121-130","Psalmii 131-140","Psalmii 141-150",
  "Proverbe 1-5","Proverbe 6-10","Proverbe 11-15","Proverbe 16-20","Proverbe 21-25","Proverbe 26-31",
  "Eclesiastul 1-6","Eclesiastul 7-12",
  "Isaia 1-6","Isaia 7-12","Isaia 13-18","Isaia 19-24","Isaia 25-30","Isaia 31-36","Isaia 37-42","Isaia 43-48","Isaia 49-54","Isaia 55-60","Isaia 61-66",
  "Ieremia 1-6","Ieremia 7-12","Ieremia 13-18","Ieremia 19-24","Ieremia 25-30","Ieremia 31-36","Ieremia 37-42","Ieremia 43-48","Ieremia 49-52",
  "Ezechiel 1-6","Ezechiel 7-12","Ezechiel 13-18","Ezechiel 19-24","Ezechiel 25-30","Ezechiel 31-36","Ezechiel 37-42","Ezechiel 43-48",
  "Daniel 1-4","Daniel 5-8","Daniel 9-12",
  // NT
  "Matei 1-4","Matei 5-7","Matei 8-11","Matei 12-14","Matei 15-18","Matei 19-22","Matei 23-25","Matei 26-28",
  "Marcu 1-4","Marcu 5-8","Marcu 9-12","Marcu 13-16",
  "Luca 1-4","Luca 5-8","Luca 9-12","Luca 13-16","Luca 17-20","Luca 21-24",
  "Ioan 1-4","Ioan 5-8","Ioan 9-12","Ioan 13-16","Ioan 17-21",
  "Faptele 1-5","Faptele 6-10","Faptele 11-15","Faptele 16-20","Faptele 21-25","Faptele 26-28",
  "Romani 1-6","Romani 7-11","Romani 12-16",
  "1 Cor 1-8","1 Cor 9-16","2 Cor 1-13",
  "Galateni + Efeseni","Filipeni + Coloseni","1-2 Tesaloniceni + 1 Tim",
  "2 Tim + Tit + Filimon + Evrei 1-5","Evrei 6-13",
  "Iacov + 1-2 Petru","1-2-3 Ioan + Iuda",
  "Apocalipsa 1-8","Apocalipsa 9-16","Apocalipsa 17-22",
];

export const PLAN_READINGS = {
  GOSPELS_42: GOSPELS_42,
  NT_42: NT_42,
  NT_60: NT_60,
  BIBLE_180: BIBLE_180_BOOKS,
};

export function getReadingForDay(planType, dayNumber) {
  const readings = PLAN_READINGS[planType];
  if (!readings) return null;
  return readings[dayNumber - 1] || null;
}

export function getDayNumberForDate(planType, startDate, date) {
  if (!startDate || !planType) return null;
  const start = new Date(startDate);
  const target = new Date(date);
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - start) / (1000 * 60 * 60 * 24)) + 1;
  const total = PLAN_META[planType]?.days || 0;
  if (diff < 1 || diff > total) return null;
  return diff;
}
