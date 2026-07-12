const shortWeekdays = ["일", "월", "화", "수", "목", "금", "토"];
const longWeekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

function isWeekday(date: Date) {
  const day = date.getDay();

  return day >= 1 && day <= 5;
}

function getDemoStartDate() {
  let date = startOfDay(new Date());

  while (!isWeekday(date)) {
    date = addDays(date, 1);
  }

  return date;
}

function getDemoWeekDates() {
  const dates: Date[] = [];
  let date = getDemoStartDate();

  while (dates.length < 5) {
    if (isWeekday(date)) {
      dates.push(new Date(date));
    }

    date = addDays(date, 1);
  }

  return dates;
}

export const demoWeekDates = getDemoWeekDates();

export function demoDate(index: number) {
  return demoWeekDates[index] ?? demoWeekDates[0];
}

export function formatShortDate(date: Date, spaced = false) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = shortWeekdays[date.getDay()];

  return spaced ? `${month}/${day} (${weekday})` : `${month}/${day}(${weekday})`;
}

export function formatCompactDate(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = shortWeekdays[date.getDay()];

  return `${month}/${day} ${weekday}`;
}

export function formatLongDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${longWeekdays[date.getDay()]}`;
}

export function formatCalendarTitle(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function formatScheduleLine(index: number, time: string, title: string) {
  return `${formatShortDate(demoDate(index))} ${time} ${title}`;
}

export function formatScheduleMeta(index: number, time: string) {
  return `${formatShortDate(demoDate(index))} ${time}`;
}

export function formatSlotLabel(index: number, time: string) {
  return `${formatLongDate(demoDate(index))} ${time}`;
}

export function formatDeadlineLabel(baseIndex: number, time: string) {
  return `${formatShortDate(demoDate(baseIndex))} ${time}`;
}

export function isBeforeToday(date: Date) {
  return startOfDay(date) < startOfDay(new Date());
}
