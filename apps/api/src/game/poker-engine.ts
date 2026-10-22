import { Card, Suit, Rank, HandRank, HandEvaluation } from './game.types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Create a fresh deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get numeric value of rank (for comparisons)
export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return values[rank];
}

// Get suit value (for tie-breaking if needed)
export function getSuitValue(suit: Suit): number {
  const values: Record<Suit, number> = {
    'clubs': 1, 'diamonds': 2, 'hearts': 3, 'spades': 4,
  };
  return values[suit];
}

// Sort cards by rank (descending)
export function sortByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
}

// Get all combinations of k cards from array
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);
  
  return [...withFirst, ...withoutFirst];
}

// Check for flush
function isFlush(cards: Card[]): boolean {
  return cards.every(c => c.suit === cards[0].suit);
}

// Check for straight (returns high card value or 0 if not straight)
function getStraightHighCard(cards: Card[]): number {
  const sorted = sortByRank(cards);
  const values = sorted.map(c => getRankValue(c.rank));
  
  // Check for A-2-3-4-5 (wheel)
  if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    return 5; // Low straight, 5 high
  }
  
  // Normal straight check
  for (let i = 0; i < 4; i++) {
    if (values[i] - values[i + 1] !== 1) {
      return 0;
    }
  }
  
  return values[0];
}

// Count ranks
function countRanks(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
}

// Evaluate a 5-card hand
function evaluate5CardHand(cards: Card[]): HandEvaluation {
  const sorted = sortByRank(cards);
  const flush = isFlush(cards);
  const straightHigh = getStraightHighCard(cards);
  const rankCounts = countRanks(cards);
  
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  const ranks = Array.from(rankCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return getRankValue(b[0]) - getRankValue(a[0]);
    })
    .map(([rank]) => rank);

  // Royal Flush
  if (flush && straightHigh === 14) {
    return {
      rank: 'royal_flush',
      value: 10000000,
      cards: sorted,
      description: 'Royal Flush',
    };
  }

  // Straight Flush
  if (flush && straightHigh > 0) {
    return {
      rank: 'straight_flush',
      value: 9000000 + straightHigh,
      cards: sorted,
      description: `Straight Flush, ${sorted[0].rank} high`,
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return {
      rank: 'four_of_kind',
      value: 8000000 + getRankValue(ranks[0]) * 100 + getRankValue(ranks[1]),
      cards: sorted,
      description: `Four of a Kind, ${ranks[0]}s`,
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: 'full_house',
      value: 7000000 + getRankValue(ranks[0]) * 100 + getRankValue(ranks[1]),
      cards: sorted,
      description: `Full House, ${ranks[0]}s full of ${ranks[1]}s`,
    };
  }

  // Flush
  if (flush) {
    const values = sorted.map(c => getRankValue(c.rank));
    return {
      rank: 'flush',
      value: 6000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4],
      cards: sorted,
      description: `Flush, ${sorted[0].rank} high`,
    };
  }

  // Straight
  if (straightHigh > 0) {
    return {
      rank: 'straight',
      value: 5000000 + straightHigh,
      cards: sorted,
      description: `Straight, ${straightHigh === 5 ? '5' : sorted[0].rank} high`,
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return {
      rank: 'three_of_kind',
      value: 4000000 + getRankValue(ranks[0]) * 10000 + getRankValue(ranks[1]) * 100 + getRankValue(ranks[2]),
      cards: sorted,
      description: `Three of a Kind, ${ranks[0]}s`,
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: 'two_pair',
      value: 3000000 + getRankValue(ranks[0]) * 10000 + getRankValue(ranks[1]) * 100 + getRankValue(ranks[2]),
      cards: sorted,
      description: `Two Pair, ${ranks[0]}s and ${ranks[1]}s`,
    };
  }

  // Pair
  if (counts[0] === 2) {
    return {
      rank: 'pair',
      value: 2000000 + getRankValue(ranks[0]) * 100000 + getRankValue(ranks[1]) * 1000 + getRankValue(ranks[2]) * 100 + getRankValue(ranks[3]),
      cards: sorted,
      description: `Pair of ${ranks[0]}s`,
    };
  }

  // High Card
  const values = sorted.map(c => getRankValue(c.rank));
  return {
    rank: 'high_card',
    value: 1000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4],
    cards: sorted,
    description: `High Card, ${sorted[0].rank}`,
  };
}

// Evaluate best 5-card hand from 7 cards (2 hole + 5 community)
export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...communityCards];
  const combinations = getCombinations(allCards, 5);
  
  let bestHand: HandEvaluation | null = null;
  
  for (const combo of combinations) {
    const evaluation = evaluate5CardHand(combo);
    if (!bestHand || evaluation.value > bestHand.value) {
      bestHand = evaluation;
    }
  }
  
  return bestHand!;
}

// Compare two hands (returns >0 if hand1 wins, <0 if hand2 wins, 0 if tie)
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  return hand1.value - hand2.value;
}

// Get rank name for display
export function getHandRankName(rank: HandRank): string {
  const names: Record<HandRank, string> = {
    'high_card': 'High Card',
    'pair': 'Pair',
    'two_pair': 'Two Pair',
    'three_of_kind': 'Three of a Kind',
    'straight': 'Straight',
    'flush': 'Flush',
    'full_house': 'Full House',
    'four_of_kind': 'Four of a Kind',
    'straight_flush': 'Straight Flush',
    'royal_flush': 'Royal Flush',
  };
  return names[rank];
}
