export type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  cuisine: string;
  cookTime: number;
  servings: number;
  featured: boolean;
  saved: boolean;
  tags: string[];
  ingredients: string[];
  steps: string[];
};

export const recipes: Recipe[] = [
  {
    id: 'gochujang-salmon-bowl',
    title: 'Gochujang Salmon Bowl',
    description: 'Sticky glazed salmon over rice with cucumber ribbons, avocado, and sesame crunch.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Korean-inspired',
    cookTime: 25,
    servings: 2,
    featured: true,
    saved: true,
    tags: ['Comfort', 'Protein-packed', 'Weeknight'],
    ingredients: [
      '2 salmon fillets',
      '2 tablespoons gochujang',
      '1 tablespoon honey',
      '2 cups cooked jasmine rice',
      '1 cucumber, shaved into ribbons',
      '1 avocado, sliced',
      '1 teaspoon toasted sesame seeds',
      '2 scallions, thinly sliced',
    ],
    steps: [
      'Whisk gochujang and honey together, then brush over the salmon fillets.',
      'Roast or pan-sear the salmon until glazed and cooked through.',
      'Divide warm rice into bowls and top with cucumber, avocado, and salmon.',
      'Finish with scallions and sesame seeds before serving.',
    ],
  },
  {
    id: 'truffle-mushroom-pasta',
    title: 'Truffle Mushroom Pasta',
    description: 'Creamy pasta with browned mushrooms, parmesan, and a hint of truffle.',
    image:
      'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Italian-inspired',
    cookTime: 30,
    servings: 3,
    featured: false,
    saved: true,
    tags: ['Comfort', 'Vegetarian', 'Date night'],
    ingredients: [
      '250g pasta',
      '300g mixed mushrooms',
      '2 cloves garlic, minced',
      '1 cup heavy cream',
      '1/2 cup grated parmesan',
      '1 teaspoon truffle oil',
      '1 tablespoon butter',
      'Parsley, for finishing',
    ],
    steps: [
      'Cook the pasta until just al dente and reserve some pasta water.',
      'Brown the mushrooms in butter until deeply caramelized, then add garlic.',
      'Pour in the cream, parmesan, and truffle oil, then simmer until silky.',
      'Toss the pasta with the sauce and loosen with pasta water if needed.',
    ],
  },
  {
    id: 'mango-shrimp-tacos',
    title: 'Mango Shrimp Tacos',
    description: 'Bright tacos packed with chili shrimp, mango salsa, and lime crema.',
    image:
      'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Mexican-inspired',
    cookTime: 20,
    servings: 4,
    featured: false,
    saved: false,
    tags: ['Seafood', 'Fresh', 'Quick'],
    ingredients: [
      '400g shrimp, peeled and deveined',
      '1 teaspoon chili powder',
      '8 small tortillas',
      '1 ripe mango, diced',
      '1/4 red onion, finely chopped',
      '1 lime',
      '1/2 cup sour cream',
      'Handful of cilantro',
    ],
    steps: [
      'Season shrimp with chili powder and sear until pink and lightly charred.',
      'Combine mango, red onion, cilantro, and lime juice for the salsa.',
      'Warm the tortillas and stir lime juice into the sour cream.',
      'Assemble tacos with shrimp, salsa, and lime crema.',
    ],
  },
  {
    id: 'crispy-tofu-salad',
    title: 'Crispy Tofu Citrus Salad',
    description: 'Golden tofu, crunchy greens, oranges, and sesame dressing in one bright bowl.',
    image:
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Asian-inspired',
    cookTime: 18,
    servings: 2,
    featured: false,
    saved: true,
    tags: ['Vegetarian', 'Fresh', 'Quick'],
    ingredients: [
      '1 block firm tofu',
      '3 cups mixed greens',
      '1 orange, segmented',
      '1 carrot, shaved',
      '1 tablespoon soy sauce',
      '1 tablespoon rice vinegar',
      '1 teaspoon sesame oil',
      '1 teaspoon maple syrup',
    ],
    steps: [
      'Press and cube the tofu, then pan-fry until deeply crisp.',
      'Whisk soy sauce, rice vinegar, sesame oil, and maple syrup together.',
      'Arrange greens, orange segments, and carrot in a serving bowl.',
      'Top with tofu and spoon over the dressing right before eating.',
    ],
  },
  {
    id: 'hot-honey-chicken-flatbread',
    title: 'Hot Honey Chicken Flatbread',
    description: 'Charred flatbread layered with spicy chicken, whipped ricotta, and arugula.',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Modern fusion',
    cookTime: 22,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Spicy', 'Shareable', 'Weeknight'],
    ingredients: [
      '2 flatbreads',
      '1 cooked chicken breast, sliced',
      '1/2 cup ricotta',
      '1 tablespoon hot honey',
      '1 cup arugula',
      '1/4 red onion, thinly sliced',
      '1/4 cup shredded mozzarella',
      'Olive oil, for brushing',
    ],
    steps: [
      'Brush flatbreads with olive oil and scatter over mozzarella.',
      'Bake until crisp, then spread with ricotta while still warm.',
      'Top with sliced chicken, red onion, and arugula.',
      'Drizzle hot honey over the top before serving.',
    ],
  },
  {
    id: 'matcha-berry-yogurt-toast',
    title: 'Matcha Berry Yogurt Toast',
    description: 'Thick toast with matcha yogurt, berries, and pistachios for a soft sweet crunch.',
    image:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Cafe-style',
    cookTime: 10,
    servings: 1,
    featured: false,
    saved: false,
    tags: ['Breakfast', 'Sweet', 'Quick'],
    ingredients: [
      '2 slices sourdough bread',
      '1/2 cup Greek yogurt',
      '1/2 teaspoon matcha powder',
      '1/2 cup mixed berries',
      '1 tablespoon chopped pistachios',
      '1 teaspoon honey',
    ],
    steps: [
      'Toast the sourdough until golden and crisp.',
      'Mix the yogurt with matcha powder until smooth and pale green.',
      'Spread the yogurt over the toast and pile on the berries.',
      'Finish with pistachios and a light drizzle of honey.',
    ],
  },
];
