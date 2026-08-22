export const shortDate = (unixDate: number): string =>
  new Date(unixDate).toLocaleString("en-us", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

export const formatDuration = (sec: number): string => {
  const minutes = Math.floor(sec / 60);
  const seconds = String(sec % 60).padStart(2, "0");
  return `${minutes}m ${seconds}s`;
};

export const gameModeName = (mode: string): string => {
  switch (mode) {
    case "CLASSIC":
      return "Summoner's Rift";
    case "ARAM":
      return "ARAM";
    case "URF":
      return "URF";
    default:
      return mode || "Match";
  }
};

export const goldK = (gold: number): string => `${(gold / 1000).toFixed(1)}k`;