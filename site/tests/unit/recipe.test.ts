import { describe, expect, it } from 'vitest';
import { formatAmount, recipeFor } from '../../src/lib/recipe';

describe('formatAmount', () => {
  it.each([
    [600, 'g', '600 g'],
    [1200, 'g', '1.2 kg'],
    [1000, 'g', '1 kg'],
    [0.5, 'cup', '½ cup'],
    [1, 'cup', '1 cup'],
    [1.5, 'cup', '1½ cups'],
    [2, 'cup', '2 cups'],
    [0.75, 'cup', '¾ cup'],
    [3, 'tbsp', '3 tbsp'],
  ] as const)('formats %d %s as %s', (amount, unit, expected) => {
    expect(formatAmount(amount, unit)).toBe(expected);
  });
});

describe('recipeFor', () => {
  it('scales ingredients and the amounts inside the steps together', () => {
    const two = recipeFor(2);
    const four = recipeFor(4);
    expect(two.ingredients[0].amount).toBe('300 g');
    expect(four.ingredients[0].amount).toBe('600 g');
    expect(four.steps.join(' ')).toContain('600 g');
    expect(four.steps.join(' ')).not.toContain('300 g');
  });
});
