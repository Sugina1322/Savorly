export type DiscoverCategoryKey =
  | 'Everyday food'
  | 'Filipino favorites'
  | 'High protein'
  | 'Breakfast'
  | 'Dessert'
  | 'Drinks';

export type DiscoverFilterKey = 'all' | DiscoverCategoryKey;

type DiscoverCategoryDefinition = {
  key: DiscoverCategoryKey;
  slug: string;
  label: string;
  pageTitle: string;
  pageSubtitle: string;
};

type DiscoverShelfDefinition = {
  key: DiscoverCategoryKey;
  title: string;
  subtitle: string;
};

export const DISCOVER_CATEGORIES: DiscoverCategoryDefinition[] = [
  {
    key: 'Everyday food',
    slug: 'everyday-food',
    label: 'Everyday',
    pageTitle: 'Everyday food',
    pageSubtitle: 'Reliable mains, rice bowls, and home-cook staples that are easy to come back to.',
  },
  {
    key: 'Filipino favorites',
    slug: 'filipino-favorites',
    label: 'Filipino',
    pageTitle: 'Filipino favorites',
    pageSubtitle: 'Comforting local dishes, pantry-friendly meals, and breakfast plates worth repeating.',
  },
  {
    key: 'High protein',
    slug: 'high-protein',
    label: 'High protein',
    pageTitle: 'High-protein recipes',
    pageSubtitle: 'More filling picks for meal prep, post-workout meals, or stronger weeknight dinners.',
  },
  {
    key: 'Breakfast',
    slug: 'breakfast',
    label: 'Breakfast',
    pageTitle: 'Breakfast and brunch',
    pageSubtitle: 'Quick starts, sweet bites, and relaxed late-morning recipes in one place.',
  },
  {
    key: 'Dessert',
    slug: 'dessert',
    label: 'Desserts',
    pageTitle: 'Desserts',
    pageSubtitle: 'Sweet endings, quick treats, and make-ahead dessert ideas for the craving side of the app.',
  },
  {
    key: 'Drinks',
    slug: 'drinks',
    label: 'Drinks',
    pageTitle: 'Drinks and sips',
    pageSubtitle: 'Coolers, lattes, and cafe-style pours when you want something lighter than a full meal.',
  },
];

export const DISCOVER_FILTERS: { key: DiscoverFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  ...DISCOVER_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
  })),
];

export const DISCOVER_SHELVES: DiscoverShelfDefinition[] = [
  {
    key: 'Everyday food',
    title: 'Weeknight comfort',
    subtitle: 'Reliable mains, bowls, and home-cook favorites.',
  },
  {
    key: 'Dessert',
    title: 'Dessert break',
    subtitle: 'Something sweet when dinner is already handled.',
  },
  {
    key: 'Drinks',
    title: 'Drinks and sips',
    subtitle: 'Coolers, lattes, and cafe-style pours for a lighter browse.',
  },
  {
    key: 'Breakfast',
    title: 'Breakfast and brunch',
    subtitle: 'Quick starts, sweet bites, and lazy-morning picks.',
  },
];

export function getDiscoverCategoryByKey(key: string) {
  return DISCOVER_CATEGORIES.find((category) => category.key === key) ?? null;
}

export function getDiscoverCategoryBySlug(slug: string) {
  return DISCOVER_CATEGORIES.find((category) => category.slug === slug) ?? null;
}
