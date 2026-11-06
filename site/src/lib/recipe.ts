export type Unit = 'g' | 'cup' | 'tbsp';

const INGREDIENTS: { name: string; perServing: number; unit: Unit }[] = [
  { name: 'Chicken thigh', perServing: 150, unit: 'g' },
  { name: 'Jasmine rice', perServing: 0.5, unit: 'cup' },
  { name: 'Broccoli', perServing: 1, unit: 'cup' },
  { name: 'Soy sauce', perServing: 1, unit: 'tbsp' },
];

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

function fraction(amount: number): string {
  const whole = Math.floor(amount);
  const part = FRACTIONS[Math.round((amount - whole) * 4) / 4] ?? '';
  return `${whole > 0 || !part ? whole : ''}${part}`;
}

export function formatAmount(amount: number, unit: Unit): string {
  if (unit === 'g') {
    return amount >= 1000 ? `${Number((amount / 1000).toFixed(1))} kg` : `${amount} g`;
  }
  const plural = unit === 'cup' && amount > 1 ? 's' : '';
  return `${fraction(amount)} ${unit}${plural}`;
}

export function recipeFor(servings: number) {
  const amounts = INGREDIENTS.map((i) => formatAmount(i.perServing * servings, i.unit));
  const [chicken, rice, broccoli, soy] = amounts;
  return {
    ingredients: INGREDIENTS.map((i, n) => ({ name: i.name, amount: amounts[n] })),
    steps: [
      `Rinse ${rice} of rice and cook it.`,
      `Sear ${chicken} of chicken with ${soy} of soy sauce.`,
      `Steam ${broccoli} of broccoli and serve.`,
    ],
  };
}
