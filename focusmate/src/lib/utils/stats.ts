export const moodToScore = (mood: string): number => {
  switch (mood) {
    case 'Happy': return 5;
    case 'Excited': return 4;
    case 'Neutral': return 3;
    case 'Tired': return 2;
    case 'Sad':
    case 'Anxious': return 1;
    default: return 0;
  }
};

export const formatLocalDate = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};
