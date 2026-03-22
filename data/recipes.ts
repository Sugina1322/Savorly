import { expansionRecipeSeeds } from '@/data/recipe-expansion';

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
  categories: string[];
  tags: string[];
  ingredients: string[];
  steps: string[];
  isUserCreated: boolean;
};

type RecipeSeed = Omit<Recipe, 'categories' | 'isUserCreated'>;

function containsAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}

function isDrinkCategoryText(text: string) {
  if (containsAny(text, ['drink', 'latte', 'smoothie', 'cooler', 'refresher', 'shake', 'sparkler', 'juice', 'milk tea'])) {
    return true;
  }

  return (
    containsAny(text, ['matcha', 'coffee', 'tea']) &&
    containsAny(text, ['milk', 'iced', 'latte', 'drink', 'cooler', 'shake', 'smoothie', 'refresher'])
  );
}

function deriveRecipeCategories(recipe: RecipeSeed) {
  const haystack = `${recipe.title} ${recipe.description} ${recipe.cuisine} ${recipe.tags.join(' ')}`
    .toLowerCase();
  const categories = new Set<string>();

  if (
    haystack.includes('truffle') ||
    haystack.includes('flatbread') ||
    haystack.includes('shareable') ||
    haystack.includes('date night') ||
    haystack.includes('crispy onion rings')
  ) {
    categories.add('Restaurant-like');
  }

  if (
    recipe.cookTime <= 20 ||
    haystack.includes('easy') ||
    haystack.includes('quick') ||
    haystack.includes('breakfast') ||
    haystack.includes('fried rice') ||
    haystack.includes('omelet') ||
    haystack.includes('omelette') ||
    haystack.includes('onigiri')
  ) {
    categories.add('Easy recipes');
  }

  if (
    haystack.includes('weeknight') ||
    haystack.includes('comfort') ||
    haystack.includes('budget') ||
    haystack.includes('home') ||
    haystack.includes('rice bowl') ||
    haystack.includes('giniling') ||
    haystack.includes('adobo') ||
    haystack.includes('noodles') ||
    haystack.includes('oyakodon') ||
    haystack.includes('congee') ||
    haystack.includes('caldo')
  ) {
    categories.add('Everyday food');
  }

  if (
    haystack.includes('high-protein') ||
    haystack.includes('protein-packed') ||
    haystack.includes('chicken') ||
    haystack.includes('tuna') ||
    haystack.includes('beef') ||
    haystack.includes('salmon') ||
    haystack.includes('egg white')
  ) {
    categories.add('High protein');
  }

  if (haystack.includes('filipino') || haystack.includes('adobo') || haystack.includes('sisig') || haystack.includes('tortang') || haystack.includes('ginisang')) {
    categories.add('Filipino favorites');
  }

  if (
    recipe.ingredients.length <= 6 ||
    haystack.includes('pantry') ||
    haystack.includes('sardines') ||
    haystack.includes('eggplant') ||
    haystack.includes('tofu') ||
    haystack.includes('canned tuna') ||
    haystack.includes('kimchi')
  ) {
    categories.add('Pantry-friendly');
  }

  if (
    haystack.includes('breakfast') ||
    haystack.includes('toast') ||
    haystack.includes('pancake') ||
    haystack.includes('tapa') ||
    haystack.includes('congee') ||
    haystack.includes('lugaw') ||
    haystack.includes('porridge') ||
    haystack.includes('onigiri') ||
    haystack.includes('omelet') ||
    haystack.includes('omelette') ||
    haystack.includes('silog') ||
    haystack.includes('arroz caldo')
  ) {
    categories.add('Breakfast');
  }

  if (
    haystack.includes('dessert') ||
    haystack.includes('banana') ||
    haystack.includes('chocolate') ||
    haystack.includes('flan') ||
    haystack.includes('maja')
  ) {
    categories.add('Dessert');
  }

  if (isDrinkCategoryText(haystack)) {
    categories.add('Drinks');
  }

  if (categories.size === 0) {
    categories.add('Everyday food');
  }

  return [...categories];
}

const recipeSeeds: RecipeSeed[] = [
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
  {
    id: 'crispy-onion-rings',
    title: 'Crispy Onion Rings',
    description: 'Golden onion rings with a light seasoned crust and a creamy dipping sauce.',
    image:
      'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'American-style',
    cookTime: 28,
    servings: 4,
    featured: false,
    saved: false,
    tags: ['Snack', 'Crispy', 'Shareable'],
    ingredients: [
      '2 large onions, sliced into rings',
      '1 cup all-purpose flour',
      '1 teaspoon paprika',
      '1 cup buttermilk',
      '1 cup breadcrumbs',
      'Vegetable oil, for frying',
      '1/3 cup mayonnaise',
      '1 tablespoon ketchup',
    ],
    steps: [
      'Separate the onion slices into rings and pat them dry.',
      'Season the flour with paprika, then dip the onion rings in buttermilk and coat with flour and breadcrumbs.',
      'Fry in hot oil until deeply golden and crisp, then drain on a rack or paper towels.',
      'Stir mayonnaise and ketchup together for a quick dip and serve immediately.',
    ],
  },
  {
    id: 'black-pepper-chicken-mushroom',
    title: 'Black Pepper Chicken and Mushroom',
    description: 'Savory chicken stir-fry with mushrooms, black pepper sauce, and glossy onions.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Chinese-inspired',
    cookTime: 24,
    servings: 3,
    featured: true,
    saved: false,
    tags: ['High-protein', 'Savory', 'Weeknight'],
    ingredients: [
      '450g chicken thigh or breast, sliced',
      '250g mushrooms, sliced',
      '1 small onion, sliced',
      '2 cloves garlic, minced',
      '1 tablespoon soy sauce',
      '1 tablespoon oyster sauce',
      '2 teaspoons freshly cracked black pepper',
      '1 teaspoon cornstarch',
    ],
    steps: [
      'Toss the chicken with soy sauce, black pepper, and cornstarch.',
      'Sear the chicken until browned, then remove and set aside.',
      'Stir-fry mushrooms, onion, and garlic until softened and lightly caramelized.',
      'Return the chicken to the pan, add oyster sauce, and toss until glossy and cooked through.',
    ],
  },
  {
    id: 'high-protein-egg-white-breakfast-wrap',
    title: 'High-Protein Egg White Breakfast Wrap',
    description: 'Packed with egg whites, turkey, spinach, and cottage cheese for a strong start.',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Breakfast',
    cookTime: 12,
    servings: 1,
    featured: false,
    saved: false,
    tags: ['High-protein', 'Breakfast', 'Quick'],
    ingredients: [
      '4 egg whites',
      '1 whole wheat tortilla',
      '80g sliced turkey breast',
      '1/3 cup cottage cheese',
      '1 handful baby spinach',
      '1 tablespoon salsa',
      'Salt and black pepper, to taste',
    ],
    steps: [
      'Scramble the egg whites with spinach until just set.',
      'Warm the tortilla and layer on the turkey, egg whites, and cottage cheese.',
      'Spoon over salsa and season with black pepper.',
      'Roll tightly and toast briefly in a dry pan if you want extra crunch.',
    ],
  },
  {
    id: 'garlic-yogurt-chicken-bowls',
    title: 'Garlic Yogurt Chicken Bowls',
    description: 'Juicy chicken over grains with cucumber salad and a tangy garlic yogurt drizzle.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Mediterranean-inspired',
    cookTime: 26,
    servings: 2,
    featured: false,
    saved: true,
    tags: ['High-protein', 'Meal prep', 'Fresh'],
    ingredients: [
      '2 chicken breasts',
      '1 cup cooked brown rice or quinoa',
      '1/2 cucumber, diced',
      '1 cup cherry tomatoes, halved',
      '1/2 cup Greek yogurt',
      '1 garlic clove, grated',
      '1 tablespoon lemon juice',
      '1 tablespoon olive oil',
    ],
    steps: [
      'Season and pan-sear the chicken until cooked through, then slice.',
      'Mix Greek yogurt, garlic, and lemon juice into a quick sauce.',
      'Toss cucumber and tomatoes with olive oil for a simple salad.',
      'Build bowls with grains, chicken, salad, and a generous spoonful of garlic yogurt.',
    ],
  },
  {
    id: 'cottage-cheese-protein-pancakes',
    title: 'Cottage Cheese Protein Pancakes',
    description: 'Tender blender pancakes with oats, cottage cheese, and extra protein in every bite.',
    image:
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Brunch',
    cookTime: 15,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['High-protein', 'Breakfast', 'Sweet'],
    ingredients: [
      '1 cup cottage cheese',
      '2 eggs',
      '1/2 cup rolled oats',
      '1/2 teaspoon cinnamon',
      '1 teaspoon vanilla extract',
      '1 teaspoon baking powder',
      'Fresh berries, for serving',
    ],
    steps: [
      'Blend the cottage cheese, eggs, oats, cinnamon, vanilla, and baking powder until smooth.',
      'Pour small rounds into a lightly greased skillet over medium heat.',
      'Cook until bubbles form, flip, and cook the second side until golden.',
      'Serve warm with fresh berries or a spoonful of yogurt.',
    ],
  },
  {
    id: 'spicy-tuna-edamame-rice-bowl',
    title: 'Spicy Tuna Edamame Rice Bowl',
    description: 'A quick bowl with tuna, edamame, rice, and a creamy spicy sauce.',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Japanese-inspired',
    cookTime: 14,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['High-protein', 'Quick', 'Meal prep'],
    ingredients: [
      '2 cups cooked rice',
      '2 cans tuna, drained',
      '1 cup shelled edamame',
      '2 tablespoons Greek yogurt or mayo',
      '1 teaspoon sriracha',
      '1/2 avocado, sliced',
      '1 sheet nori, cut into strips',
      '1 scallion, sliced',
    ],
    steps: [
      'Stir the tuna with Greek yogurt or mayo and sriracha until creamy.',
      'Warm the edamame and divide the rice between bowls.',
      'Top with spicy tuna, avocado, edamame, scallions, and nori strips.',
      'Serve as is or add a dash of soy sauce for extra seasoning.',
    ],
  },
  {
    id: 'lean-beef-broccoli-noodle-stir-fry',
    title: 'Lean Beef Broccoli Noodle Stir-Fry',
    description: 'A fast skillet dinner with lean beef, tender broccoli, and slick savory noodles.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Asian-inspired',
    cookTime: 20,
    servings: 3,
    featured: false,
    saved: true,
    tags: ['High-protein', 'Weeknight', 'Comfort'],
    ingredients: [
      '300g lean beef, thinly sliced',
      '200g noodles',
      '2 cups broccoli florets',
      '2 tablespoons soy sauce',
      '1 tablespoon hoisin sauce',
      '2 cloves garlic, minced',
      '1 teaspoon sesame oil',
      '1 teaspoon cornstarch',
    ],
    steps: [
      'Cook the noodles and set aside.',
      'Toss the beef with cornstarch, then sear quickly in a hot pan.',
      'Cook the broccoli with garlic until bright and tender-crisp.',
      'Return the beef to the pan with soy sauce, hoisin, sesame oil, and noodles, then toss to coat.',
    ],
  },
  {
    id: 'greek-yogurt-chicken-salad-stuffed-avocado',
    title: 'Greek Yogurt Chicken Salad Stuffed Avocado',
    description: 'Creamy chicken salad lightened with Greek yogurt and spooned into ripe avocado halves.',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Light lunch',
    cookTime: 15,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['High-protein', 'Low-carb', 'Fresh'],
    ingredients: [
      '2 cooked chicken breasts, shredded',
      '1/3 cup Greek yogurt',
      '1 tablespoon Dijon mustard',
      '1 celery stalk, finely chopped',
      '1 tablespoon chopped herbs',
      '1 avocado, halved',
      '1 teaspoon lemon juice',
      'Salt and pepper, to taste',
    ],
    steps: [
      'Mix shredded chicken with Greek yogurt, Dijon, celery, herbs, and lemon juice.',
      'Season the filling well with salt and pepper.',
      'Spoon the chicken salad into the avocado halves.',
      'Serve chilled or at room temperature for a quick lunch.',
    ],
  },
  {
    id: 'tofu-sisig',
    title: 'Tofu Sisig',
    description: 'Crispy tofu tossed with onions, chilies, calamansi, and a creamy sizzling-style sauce.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 20,
    servings: 3,
    featured: true,
    saved: false,
    tags: ['Easy', 'Filipino', 'Vegetarian'],
    ingredients: [
      '1 block firm tofu, cubed',
      '1 small red onion, chopped',
      '2 cloves garlic, minced',
      '1 red chili or siling labuyo, sliced',
      '2 tablespoons mayonnaise',
      '1 tablespoon soy sauce',
      '1 tablespoon calamansi or lemon juice',
      '1 teaspoon butter or oil',
    ],
    steps: [
      'Pan-fry or air-fry the tofu until crisp and golden on all sides.',
      'Saute onion, garlic, and chili until fragrant and slightly softened.',
      'Stir in mayonnaise, soy sauce, and calamansi juice to make a quick sisig-style sauce.',
      'Toss the crispy tofu in the sauce and serve hot with rice.',
    ],
  },
  {
    id: 'chicken-adobo-rice-bowl',
    title: 'Chicken Adobo Rice Bowl',
    description: 'A simple adobo-style chicken bowl with soy, vinegar, garlic, and warm rice.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 30,
    servings: 3,
    featured: false,
    saved: false,
    tags: ['Easy', 'Filipino', 'Comfort'],
    ingredients: [
      '500g chicken thighs, chopped',
      '3 cloves garlic, smashed',
      '3 tablespoons soy sauce',
      '2 tablespoons vinegar',
      '1 bay leaf',
      '1 teaspoon whole black pepper or cracked pepper',
      '2 cups cooked rice',
      '1 teaspoon brown sugar',
    ],
    steps: [
      'Brown the chicken in a pan until lightly golden.',
      'Add garlic, soy sauce, vinegar, bay leaf, pepper, and brown sugar.',
      'Pour in a small splash of water and simmer until the chicken is tender and glossy.',
      'Serve over hot rice with extra sauce spooned on top.',
    ],
  },
  {
    id: 'tortang-talong',
    title: 'Tortang Talong',
    description: 'Smoky eggplant omelet that is cheap, filling, and perfect with garlic rice.',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 18,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Easy', 'Filipino', 'Budget'],
    ingredients: [
      '2 Asian eggplants',
      '2 eggs, beaten',
      '2 cloves garlic, minced',
      'Salt and black pepper, to taste',
      '1 tablespoon oil',
      'Steamed rice, for serving',
    ],
    steps: [
      'Roast or pan-char the eggplants until soft, then peel off the skins.',
      'Flatten each eggplant gently with a fork.',
      'Season the beaten eggs with garlic, salt, and pepper, then dip the eggplants in the mixture.',
      'Pan-fry until golden on both sides and serve with rice.',
    ],
  },
  {
    id: 'ginisang-sardinas-pechay',
    title: 'Ginisang Sardinas with Pechay',
    description: 'A pantry-friendly Filipino meal with canned sardines, greens, and lots of garlic.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 12,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Easy', 'Filipino', 'Budget'],
    ingredients: [
      '1 can sardines in tomato sauce',
      '1 bunch pechay or bok choy',
      '1 small onion, sliced',
      '3 cloves garlic, minced',
      '1 small tomato, chopped',
      '1 teaspoon oil',
      'Black pepper, to taste',
    ],
    steps: [
      'Saute onion and garlic in oil until fragrant.',
      'Add tomato and cook until softened.',
      'Pour in the sardines with the sauce and simmer briefly.',
      'Add pechay and cook just until wilted, then season with black pepper.',
    ],
  },
  {
    id: 'beef-tapa-breakfast-plate',
    title: 'Beef Tapa Breakfast Plate',
    description: 'Sweet-savory beef strips served with rice and egg for an easy tapsilog-style meal.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 22,
    servings: 2,
    featured: false,
    saved: true,
    tags: ['Easy', 'Filipino', 'Breakfast'],
    ingredients: [
      '300g beef sirloin, thinly sliced',
      '2 tablespoons soy sauce',
      '1 tablespoon calamansi or lemon juice',
      '1 tablespoon brown sugar',
      '3 cloves garlic, minced',
      '2 eggs',
      '2 cups cooked rice',
      'Oil, for frying',
    ],
    steps: [
      'Marinate the beef in soy sauce, calamansi, brown sugar, and garlic for a few minutes.',
      'Pan-fry the beef until browned and slightly caramelized.',
      'Fry the eggs to your liking in the same pan.',
      'Serve the tapa with rice and egg for a quick silog-style plate.',
    ],
  },
  {
    id: 'giniling-with-potatoes',
    title: 'Pork Giniling with Potatoes',
    description: 'Hearty ground pork with potatoes, carrots, and tomato sauce for an easy rice meal.',
    image:
      'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 25,
    servings: 4,
    featured: false,
    saved: false,
    tags: ['Easy', 'Filipino', 'Weeknight'],
    ingredients: [
      '400g ground pork',
      '1 potato, diced',
      '1 carrot, diced',
      '1 small onion, chopped',
      '3 cloves garlic, minced',
      '1 small tomato, chopped',
      '1/2 cup tomato sauce',
      '1/2 cup peas',
    ],
    steps: [
      'Saute onion, garlic, and tomato until soft and aromatic.',
      'Add the ground pork and cook until no longer pink.',
      'Stir in potato, carrot, and tomato sauce with a splash of water.',
      'Simmer until the vegetables are tender, then add peas and serve with rice.',
    ],
  },
  {
    id: 'pad-kra-pao',
    title: 'Pad Kra Pao',
    description: 'Budget-friendly Thai basil stir-fry with ground meat, chilies, and a salty-sweet sauce.',
    image:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Thai-inspired',
    cookTime: 18,
    servings: 3,
    featured: false,
    saved: false,
    tags: ['Easy', 'Budget', 'Weeknight'],
    ingredients: [
      '400g ground chicken or pork',
      '4 cloves garlic, minced',
      '2 chilies, chopped',
      '1 tablespoon soy sauce',
      '1 tablespoon oyster sauce',
      '1 teaspoon sugar',
      '1 handful basil leaves',
      'Cooked rice, for serving',
    ],
    steps: [
      'Brown the ground meat in a hot pan and break it up into small bits.',
      'Add garlic and chilies, then stir-fry until fragrant.',
      'Pour in soy sauce, oyster sauce, and sugar, then toss until glossy.',
      'Fold in basil leaves at the end and serve over rice.',
    ],
  },
  {
    id: 'budget-chicken-adobo',
    title: 'Budget Chicken Adobo',
    description: 'A simple pantry adobo with garlic, soy sauce, vinegar, and chicken pieces simmered until glossy.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 35,
    servings: 4,
    featured: false,
    saved: false,
    tags: ['Budget', 'Filipino', 'Everyday'],
    ingredients: [
      '700g chicken drumsticks or thighs',
      '5 cloves garlic, smashed',
      '1/4 cup soy sauce',
      '1/4 cup vinegar',
      '2 bay leaves',
      '1 teaspoon black peppercorns',
      '1 teaspoon brown sugar',
      'Cooked rice, for serving',
    ],
    steps: [
      'Lightly brown the chicken pieces in a pot or deep pan.',
      'Add garlic, soy sauce, vinegar, bay leaves, peppercorns, and brown sugar.',
      'Pour in a little water and simmer gently until the chicken is tender.',
      'Reduce the sauce until glossy and serve with hot rice.',
    ],
  },
  {
    id: 'gochujang-tofu-tomato-skillet',
    title: 'Gochujang Tofu with Tomato',
    description: 'A cheap skillet dinner with tofu, tomatoes, garlic, and spicy gochujang sauce.',
    image:
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Korean-inspired',
    cookTime: 17,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Easy', 'Budget', 'Vegetarian'],
    ingredients: [
      '1 block firm tofu, cubed',
      '2 tomatoes, chopped',
      '3 cloves garlic, minced',
      '1 tablespoon gochujang',
      '1 teaspoon soy sauce',
      '1 teaspoon sugar or honey',
      '1 scallion, sliced',
      'Cooked rice, for serving',
    ],
    steps: [
      'Pan-fry the tofu until the edges are golden and lightly crisp.',
      'Cook the garlic and tomatoes until they soften into a chunky sauce.',
      'Stir in gochujang, soy sauce, and sugar, then return the tofu to the pan.',
      'Simmer briefly and finish with scallions before serving over rice.',
    ],
  },
  {
    id: 'egg-fried-rice',
    title: 'Egg Fried Rice',
    description: 'Fast leftover-rice fried rice with eggs, garlic, and whatever vegetables you have around.',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Asian-inspired',
    cookTime: 12,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Budget', 'Quick', 'Pantry'],
    ingredients: [
      '2 cups cold cooked rice',
      '2 eggs',
      '3 cloves garlic, minced',
      '2 tablespoons mixed vegetables or peas',
      '1 tablespoon soy sauce',
      '1 scallion, sliced',
      '1 teaspoon oil',
    ],
    steps: [
      'Scramble the eggs in a hot pan, then set them aside.',
      'Saute garlic in oil, add the rice, and break up any clumps.',
      'Stir in vegetables, soy sauce, and the cooked eggs.',
      'Finish with scallions and serve hot.',
    ],
  },
  {
    id: 'soy-garlic-noodles',
    title: 'Soy Garlic Noodles',
    description: 'Cheap pantry noodles tossed with soy sauce, garlic, butter, and a little sweetness.',
    image:
      'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Asian-inspired',
    cookTime: 15,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Budget', 'Quick', 'Everyday'],
    ingredients: [
      '200g noodles',
      '4 cloves garlic, minced',
      '2 tablespoons soy sauce',
      '1 tablespoon butter',
      '1 teaspoon sugar',
      '1 teaspoon chili flakes',
      '1 scallion, sliced',
    ],
    steps: [
      'Cook the noodles and reserve a splash of the cooking water.',
      'Cook garlic in butter until fragrant but not too dark.',
      'Add soy sauce, sugar, chili flakes, and a little noodle water.',
      'Toss the noodles through the sauce and finish with scallions.',
    ],
  },
  {
    id: 'arroz-caldo',
    title: 'Arroz Caldo',
    description: 'Gingery Filipino rice porridge with chicken, garlic chips, and egg for a cheap comforting bowl.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 30,
    servings: 4,
    featured: false,
    saved: false,
    tags: ['Budget', 'Comfort', 'Breakfast'],
    ingredients: [
      '500g chicken thighs, cut into chunks',
      '1 cup uncooked rice',
      '6 cups chicken broth or water',
      '1 thumb ginger, julienned',
      '4 cloves garlic, minced',
      '2 tablespoons fish sauce',
      '2 hard-boiled eggs, halved',
      '2 scallions, sliced',
    ],
    steps: [
      'Saute half of the garlic with the ginger until fragrant, then add the chicken and cook until lightly opaque on the outside.',
      'Stir in the rice, pour in the broth, and simmer while stirring from time to time until the grains soften and thicken the pot.',
      'Season with fish sauce and add a splash of water if the porridge gets too thick before the chicken finishes cooking.',
      'Top each bowl with egg, scallions, and the remaining garlic toasted in a little oil if you want extra crunch.',
    ],
  },
  {
    id: 'tuna-mayo-onigiri',
    title: 'Tuna Mayo Onigiri',
    description: 'Rice balls packed with tuna mayo and nori for an easy grab-and-go breakfast or lunch.',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Japanese-inspired',
    cookTime: 15,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Budget', 'Quick', 'Breakfast'],
    ingredients: [
      '2 1/4 cups cooked short-grain rice',
      '1/2 can tuna, drained',
      '1 tablespoon mayonnaise',
      '1/2 teaspoon soy sauce',
      '1/4 teaspoon salt',
      '1 sheet nori, cut into strips',
    ],
    steps: [
      'Mix the tuna with mayonnaise and soy sauce until creamy and evenly seasoned.',
      'Wet your hands lightly, sprinkle them with salt, and flatten a portion of warm rice in your palm.',
      'Place a spoonful of tuna filling in the center, cover it with more rice, and shape it into a triangle or round ball.',
      'Wrap each onigiri with a strip of nori just before serving so the seaweed stays crisp.',
    ],
  },
  {
    id: 'oyakodon',
    title: 'Oyakodon',
    description: 'Japanese rice bowl with chicken, onion, and silky eggs simmered in a sweet-savory sauce.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Japanese-inspired',
    cookTime: 20,
    servings: 2,
    featured: true,
    saved: false,
    tags: ['Budget', 'Comfort', 'High-protein'],
    ingredients: [
      '250g boneless chicken thighs, bite-sized',
      '1/2 onion, thinly sliced',
      '3 eggs, lightly beaten',
      '2 cups cooked rice',
      '1 cup light broth or water',
      '2 tablespoons soy sauce',
      '1 tablespoon mirin or sugar',
      '1 scallion, sliced',
    ],
    steps: [
      'Simmer the onion in the broth with soy sauce and mirin until it starts to soften and sweeten.',
      'Add the chicken and cook gently until the pieces are tender and no longer pink in the middle.',
      'Drizzle in the eggs, cover briefly, and let them set softly so the top stays silky instead of dry.',
      'Spoon everything over hot rice and finish with scallions for an easy one-bowl meal.',
    ],
  },
  {
    id: 'chinese-tomato-egg-stir-fry',
    title: 'Chinese Tomato Egg Stir-Fry',
    description: 'Soft scrambled eggs and juicy tomatoes in a fast Chinese home-style sauce that is cheap and satisfying.',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Chinese-inspired',
    cookTime: 10,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Budget', 'Quick', 'Vegetarian'],
    ingredients: [
      '4 eggs',
      '3 tomatoes, cut into wedges',
      '1 scallion, chopped',
      '1/2 teaspoon salt',
      '1/4 teaspoon white or black pepper',
      '1 teaspoon sugar',
      '2 tablespoons oil',
      '2 tablespoons water',
    ],
    steps: [
      'Beat the eggs with half the salt and pepper, then scramble them in hot oil until softly set before taking them out of the pan.',
      'Cook the tomatoes with scallion, sugar, the remaining salt, and a splash of water until they collapse into a light sauce.',
      'Return the eggs to the pan and fold gently so they stay tender while picking up the tomato juices.',
      'Serve immediately with rice while the eggs are still soft and the tomatoes are saucy.',
    ],
  },
  {
    id: 'kimchi-fried-rice',
    title: 'Kimchi Fried Rice',
    description: 'Leftover rice fried with kimchi, gochujang, and a sunny egg for a spicy Korean comfort meal.',
    image:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Korean-inspired',
    cookTime: 15,
    servings: 2,
    featured: true,
    saved: false,
    tags: ['Budget', 'Quick', 'Comfort'],
    ingredients: [
      '2 cups cold cooked rice',
      '1 cup kimchi, chopped',
      '2 tablespoons kimchi juice or water',
      '1 tablespoon gochujang',
      '1 teaspoon sesame oil',
      '1 teaspoon oil',
      '1 scallion, sliced',
      '2 fried eggs, for topping',
    ],
    steps: [
      'Stir-fry the kimchi in oil for about a minute so it loses some raw sharpness and starts to caramelize.',
      'Add the rice, kimchi juice, and gochujang, then break up any clumps until the grains are evenly coated and hot.',
      'Finish with sesame oil and scallions, tasting once to see if the kimchi already provides enough salt.',
      'Top each portion with a fried egg and serve while the rice is still steaming.',
    ],
  },
  {
    id: 'kai-jeow-rice',
    title: 'Kai Jeow Rice',
    description: 'Thai-style crispy omelet over hot rice with fish sauce and a little sriracha on the side.',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Thai-inspired',
    cookTime: 10,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Budget', 'Quick', 'Breakfast'],
    ingredients: [
      '4 eggs',
      '1 tablespoon fish sauce',
      '1/4 teaspoon ground pepper',
      '2 teaspoons water',
      '3 tablespoons oil',
      '2 cups cooked jasmine rice',
      'Sriracha or chili sauce, for serving',
    ],
    steps: [
      'Beat the eggs very well with fish sauce, pepper, and water until the mixture looks loose and lightly frothy.',
      'Heat the oil until quite hot, then pour in the eggs and let them puff up and crisp around the edges.',
      'Flip once and cook the second side just until golden and fully set in the center.',
      'Slide the omelet over hot rice and serve with a little chili sauce on the side.',
    ],
  },
  {
    id: 'poor-mans-thai-noodles',
    title: 'Poor Man\'s Thai Noodles',
    description: 'Wide rice noodles tossed with bean sprouts, scallions, and a sweet soy sauce that tastes bigger than it costs.',
    image:
      'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Thai-inspired',
    cookTime: 18,
    servings: 3,
    featured: false,
    saved: false,
    tags: ['Budget', 'Quick', 'Pantry'],
    ingredients: [
      '250g wide rice noodles',
      '3 cloves garlic, sliced',
      '4 scallions, cut into short lengths',
      '2 cups bean sprouts',
      '1 1/2 tablespoons soy sauce',
      '1 tablespoon dark soy sauce',
      '1 teaspoon fish sauce',
      '1 tablespoon brown sugar',
    ],
    steps: [
      'Soften or cook the noodles according to the package directions, then drain well so they do not water down the sauce.',
      'Stir together the soy sauces, fish sauce, and brown sugar until the sugar mostly dissolves.',
      'Cook the garlic and scallion whites in a little oil, add the noodles, and toss quickly with the sauce until evenly colored.',
      'Fold in the bean sprouts and scallion greens at the end so they stay crisp and fresh against the rich noodles.',
    ],
  },
  {
    id: 'scallion-oil-noodles',
    title: 'Scallion Oil Noodles',
    description: 'Shanghai-style noodles coated in fragrant scallion oil and soy sauce for a cheap but restaurant-looking bowl.',
    image:
      'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Chinese-inspired',
    cookTime: 20,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Budget', 'Quick', 'Pantry'],
    ingredients: [
      '200g thin wheat noodles',
      '6 scallions, cut into short lengths',
      '1/4 cup neutral oil',
      '2 tablespoons light soy sauce',
      '1 tablespoon dark soy sauce',
      '2 teaspoons sugar',
    ],
    steps: [
      'Cook the noodles until springy, then rinse briefly and drain while you build the sauce.',
      'Fry the scallions in the oil over medium heat until they turn deep golden and smell sweet, being careful not to burn them.',
      'Stir the soy sauces and sugar into the hot scallion oil just until the sugar melts into a glossy dressing.',
      'Toss the noodles with the sauce and crispy scallions right away so every strand gets coated.',
    ],
  },
  {
    id: 'banana-turon',
    title: 'Banana Turon',
    description: 'Caramelized banana spring rolls with crisp wrappers and a sweet golden finish.',
    image:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 20,
    servings: 4,
    featured: false,
    saved: false,
    tags: ['Dessert', 'Budget', 'Sweet'],
    ingredients: [
      '4 saba bananas or ripe bananas',
      '8 spring roll wrappers',
      '4 tablespoons brown sugar',
      'Oil, for frying',
    ],
    steps: [
      'Roll banana pieces in brown sugar, then wrap them tightly in spring roll wrappers.',
      'Heat oil in a pan and fry the turon until crisp and golden.',
      'Let the sugar caramelize lightly on the wrapper as it cooks.',
      'Drain briefly and serve while still warm and crisp.',
    ],
  },
  {
    id: 'milo-lava-mug-cake',
    title: 'Milo Lava Mug Cake',
    description: 'A quick chocolatey dessert made in a mug with pantry staples and a gooey center.',
    image:
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Quick dessert',
    cookTime: 6,
    servings: 1,
    featured: false,
    saved: false,
    tags: ['Dessert', 'Quick', 'Budget'],
    ingredients: [
      '4 tablespoons Milo or cocoa drink powder',
      '3 tablespoons flour',
      '2 tablespoons sugar',
      '3 tablespoons milk',
      '2 tablespoons oil',
      '1 tablespoon chocolate chips',
    ],
    steps: [
      'Mix Milo, flour, sugar, milk, and oil in a microwave-safe mug.',
      'Drop the chocolate chips into the center.',
      'Microwave until the cake is set around the edges but still soft in the middle.',
      'Cool for a minute and eat straight from the mug.',
    ],
  },
  {
    id: 'maja-blanca-cups',
    title: 'Maja Blanca Cups',
    description: 'Creamy coconut corn pudding served chilled in little cups for an easy make-ahead dessert.',
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino',
    cookTime: 18,
    servings: 6,
    featured: false,
    saved: false,
    tags: ['Dessert', 'Filipino', 'Make-ahead'],
    ingredients: [
      '2 cups coconut milk',
      '1/2 cup cornstarch',
      '1/2 cup sugar',
      '1 cup corn kernels',
      '1/4 cup evaporated milk',
      'Toasted coconut or cheese, for topping',
    ],
    steps: [
      'Whisk coconut milk, cornstarch, sugar, and evaporated milk together in a pot.',
      'Cook over medium heat, stirring constantly, until thick and smooth.',
      'Fold in the corn kernels and spoon the mixture into serving cups.',
      'Chill until set, then top before serving.',
    ],
  },
  {
    id: 'brown-sugar-iced-latte',
    title: 'Brown Sugar Iced Latte',
    description: 'Chilled espresso with brown sugar syrup and creamy milk over plenty of ice.',
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Cafe-style',
    cookTime: 6,
    servings: 1,
    featured: false,
    saved: true,
    tags: ['Drink', 'Cafe-style', 'Quick'],
    ingredients: [
      '2 shots espresso',
      '1 tablespoon brown sugar',
      '1 tablespoon hot water',
      '3/4 cup milk',
      'Ice cubes',
    ],
    steps: [
      'Dissolve the brown sugar in the hot water to make a quick syrup.',
      'Fill a glass with ice and pour in the syrup and espresso.',
      'Top with milk and stir until lightly marbled.',
      'Serve cold right away.',
    ],
  },
  {
    id: 'mango-calamansi-cooler',
    title: 'Mango Calamansi Cooler',
    description: 'Bright mango drink with calamansi, cold water, and a refreshing citrus finish.',
    image:
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Filipino-inspired',
    cookTime: 8,
    servings: 2,
    featured: false,
    saved: false,
    tags: ['Drink', 'Fresh', 'Quick'],
    ingredients: [
      '1 ripe mango, chopped',
      '3 calamansi or 1 lime',
      '1 1/2 cups cold water',
      '1 to 2 tablespoons sugar or honey',
      'Ice cubes',
    ],
    steps: [
      'Blend the mango with cold water until smooth.',
      'Stir in calamansi juice and sweeten to taste.',
      'Pour over ice and taste for balance.',
      'Serve immediately while very cold.',
    ],
  },
  {
    id: 'strawberry-matcha-milk',
    title: 'Strawberry Matcha Milk',
    description: 'Layered strawberry milk and matcha poured over ice for a sweet earthy cafe treat.',
    image:
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=1200&q=80',
    cuisine: 'Cafe-style',
    cookTime: 7,
    servings: 1,
    featured: false,
    saved: false,
    tags: ['Drink', 'Sweet', 'Quick'],
    ingredients: [
      '3 strawberries, mashed',
      '1 teaspoon sugar or honey',
      '1 teaspoon matcha powder',
      '2 tablespoons hot water',
      '3/4 cup milk',
      'Ice cubes',
    ],
    steps: [
      'Mash the strawberries with sugar until juicy.',
      'Whisk the matcha with hot water until smooth.',
      'Add the strawberry mixture and ice to a glass, then pour in the milk.',
      'Finish with the matcha on top for a layered drink.',
    ],
  },
];

export const recipes: Recipe[] = [...recipeSeeds, ...expansionRecipeSeeds].map((recipe) => ({
  ...recipe,
  categories: deriveRecipeCategories(recipe),
  isUserCreated: false,
}));
