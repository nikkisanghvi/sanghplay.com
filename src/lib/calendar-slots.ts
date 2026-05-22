/**
 * Lightweight list of selectable slots for the prototype — weekdays only.
 */

export type CalendarSlot = {
  id: string;
  iso: string;
  labelShort: string;
};

export function buildPrototypeSlots(maxSlots = 14): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const start = new Date();

  outer: for (let d = 1; d < 28 && slots.length < maxSlots; d++) {
    const base = new Date(start);
    base.setDate(start.getDate() + d);

    const dow = base.getDay();
    if (dow === 0 || dow === 6) continue;

    for (const h of [16, 17, 18]) {
      const when = new Date(base);
      when.setHours(h, 0, 0, 0);
      const iso = when.toISOString();
      slots.push({
        id: iso,
        iso,
        labelShort: `${new Intl.DateTimeFormat(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(when)} · ${new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).format(when)}`,
      });
      if (slots.length >= maxSlots) break outer;
    }
  }

  return slots;
}
