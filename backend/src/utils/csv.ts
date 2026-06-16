export function convertToCsv<T extends Record<string, any>>(
  data: T[],
  columns?: { key: string; label: string }[]
): string {
  if (data.length === 0) return "";

  const keys =
    columns?.map((column) => column.key) || Object.keys(data[0]);
  const headers =
    columns?.map((column) => column.label) || keys;

  const escapeCsvValue = (value: any): string => {
    const stringValue = value == null ? "" : String(value);
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const rows = data.map((item) =>
    keys.map((key) => escapeCsvValue(item[key])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function parseCsvToJson(
  csvContent: string
): Record<string, string>[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const results: Record<string, string>[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const values = parseCsvLine(lines[lineIndex]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index].trim();
      });
      results.push(row);
    }
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let charIndex = 0; charIndex < line.length; charIndex++) {
    const character = line[charIndex];

    if (inQuotes) {
      if (character === '"') {
        if (charIndex + 1 < line.length && line[charIndex + 1] === '"') {
          current += '"';
          charIndex++;
        } else {
          inQuotes = false;
        }
      } else {
        current += character;
      }
    } else {
      if (character === '"') {
        inQuotes = true;
      } else if (character === ",") {
        result.push(current);
        current = "";
      } else {
        current += character;
      }
    }
  }

  result.push(current);
  return result;
}
