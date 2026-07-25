function hashText(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayInputValue() {
  return toDateInputValue(new Date());
}

export function getUpcomingTourDates(tourId: string, count = 3) {
  const today = new Date();
  const offset = (hashText(tourId) % 5) + 1;

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(today, offset + index * 7);
    return {
      inputValue: toDateInputValue(date),
      label: new Intl.DateTimeFormat("uz-UZ", {
        day: "numeric",
        month: "short",
      }).format(date),
    };
  });
}

export function formatSelectedTourDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
