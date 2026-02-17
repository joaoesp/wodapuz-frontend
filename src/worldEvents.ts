export interface WorldEvent {
  startYear: number;
  endYear: number;
  label: string;
  yearLabel: string;
}

export const GDP_GROWTH_EVENTS: WorldEvent[] = [
  { startYear: 1973, endYear: 1973, label: "Oil Crisis", yearLabel: "1973" },
  { startYear: 1979, endYear: 1979, label: "Oil Crisis", yearLabel: "1979" },
  {
    startYear: 1982,
    endYear: 1995,
    label: "Latin American Debt Crisis",
    yearLabel: "1982–1990",
  },
  {
    startYear: 1991,
    endYear: 1991,
    label: "Dissolution of Soviet Union",
    yearLabel: "1991",
  },
  {
    startYear: 1997,
    endYear: 1998,
    label: "Asian Financial Crisis",
    yearLabel: "1997–1998",
  },
  { startYear: 2000, endYear: 2000, label: "Dot-com Bubble", yearLabel: "2000" },
  {
    startYear: 2008,
    endYear: 2008,
    label: "Global Financial Crisis",
    yearLabel: "2008",
  },
  {
    startYear: 2009,
    endYear: 2015,
    label: "European Sovereign Debt Crisis",
    yearLabel: "2009–2015",
  },
  {
    startYear: 2014,
    endYear: 2016,
    label: "Oil Price Collapse",
    yearLabel: "2014–2016",
  },
  {
    startYear: 2020,
    endYear: 2020,
    label: "COVID-19 Pandemic",
    yearLabel: "2020",
  },
];

export function getEventsForYear(year: number): WorldEvent[] {
  return GDP_GROWTH_EVENTS.filter((e) => year >= e.startYear && year <= e.endYear);
}
