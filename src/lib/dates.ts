function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRelativeDate(value?: string) {
  const date = parseDate(value);
  if (!date) return value ?? null;

  const differenceInDays = Math.round(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) /
      86_400_000,
  );

  if (differenceInDays === 0) return "Today";
  if (differenceInDays === -1) return "Yesterday";
  if (differenceInDays === 1) return "Tomorrow";
  if (differenceInDays > -7 && differenceInDays < 0) return `${Math.abs(differenceInDays)} days ago`;
  if (differenceInDays > 1 && differenceInDays < 7) return `In ${differenceInDays} days`;

  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function getReminderDetails(value?: string) {
  const date = parseDate(value);
  if (!date) return null;

  const relativeDate = formatRelativeDate(value);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  const overdue = date.getTime() < Date.now();

  return {
    label: `${overdue ? "Overdue" : "Reminder"} · ${relativeDate} at ${time}`,
    overdue,
  };
}
