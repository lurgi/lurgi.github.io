export const sortByDateDesc = <T extends { date: string }>(arr: T[]): T[] => {
  return arr.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // 최신 날짜가 앞으로
  });
};

export const sortByDateAsc = <T extends { date: string }>(arr: T[]): T[] => {
  return arr.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime(); // 최신 날짜가 앞으로
  });
};
