import { LOCALE } from "@config";

interface DateFormatterProps {
  pubDatetime: string | Date;
  modDatetime?: string | Date | null;
  className?: string;
}

export default function DateFormatter({
  pubDatetime,
  modDatetime,
  className = "",
}: DateFormatterProps) {
  // Format the dates
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(LOCALE.langTag, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pubDate = formatDate(pubDatetime);

  // Create the display text
  let dateText = pubDate;

  if (modDatetime && new Date(modDatetime) > new Date(pubDatetime)) {
    const modDate = formatDate(modDatetime);
    dateText = `${pubDate}, updated ${modDate}`;
  }

  return <div className={`date-info ${className}`}>{dateText}</div>;
}
