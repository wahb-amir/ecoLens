export const WASTE_POINTS: Record<string, number> = {
  plastic: 15,
  paper: 10,
  glass: 20,
  metal: 25,
  organic: 12,
  other: 5,
};

// Map AI labels to your schema categories
export const labelToCategory = (label: string): string => {
  const map: Record<string, string> = {
    'pet-bottle': 'plastic',
    'newspaper': 'paper',
    'wine-bottle': 'glass',
    'soda-can': 'metal',
    'banana-peel': 'organic',
    // ... add more AI labels here
  };
  return map[label.toLowerCase()] || 'other';
};