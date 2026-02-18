import {
  ShoppingCart,
  Utensils,
  Film,
  Plane,
  Car,
  Home,
  Zap,
  Wifi,
  Phone,
  Gift,
  ShoppingBag,
  Coffee,
  Beer,
  Wine,
  Pizza,
  Fuel,
  Train,
  Bus,
  Ticket,
  Music,
  Gamepad2,
  Dumbbell,
  Stethoscope,
  Pill,
  GraduationCap,
  Book,
  Baby,
  PawPrint,
  Scissors,
  Shirt,
  Sparkles,
  Wrench,
  Hammer,
  TreePine,
  Tent,
  Mountain,
  Waves,
  Sun,
  Snowflake,
  PartyPopper,
  Cake,
  Heart,
  CreditCard,
  Banknote,
  Receipt,
  MoreHorizontal
} from 'lucide-react';

// Category definitions with keywords and icons
export const expenseCategories = [
  {
    id: 'groceries',
    name: 'Groceries',
    icon: ShoppingCart,
    color: 'bg-emerald-100 text-emerald-600',
    keywords: ['grocery', 'groceries', 'supermarket', 'market', 'walmart', 'costco', 'trader joe', 'whole foods', 'aldi', 'kroger', 'safeway', 'target', 'food shopping']
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: Utensils,
    color: 'bg-orange-100 text-orange-600',
    keywords: ['restaurant', 'dinner', 'lunch', 'breakfast', 'brunch', 'dining', 'eat out', 'meal', 'food', 'bistro', 'cafe', 'diner', 'buffet', 'takeout', 'take out', 'delivery']
  },
  {
    id: 'coffee',
    name: 'Coffee & Drinks',
    icon: Coffee,
    color: 'bg-amber-100 text-amber-700',
    keywords: ['coffee', 'starbucks', 'dunkin', 'tea', 'boba', 'smoothie', 'juice', 'latte', 'cappuccino', 'espresso']
  },
  {
    id: 'bar',
    name: 'Bar & Drinks',
    icon: Beer,
    color: 'bg-yellow-100 text-yellow-700',
    keywords: ['bar', 'drinks', 'beer', 'wine', 'cocktail', 'pub', 'brewery', 'alcohol', 'club', 'nightclub', 'happy hour']
  },
  {
    id: 'pizza',
    name: 'Pizza & Fast Food',
    icon: Pizza,
    color: 'bg-red-100 text-red-600',
    keywords: ['pizza', 'dominos', 'papa john', 'burger', 'mcdonald', 'wendy', 'taco bell', 'kfc', 'chick-fil-a', 'subway', 'chipotle', 'fast food']
  },
  {
    id: 'movies',
    name: 'Movies & Entertainment',
    icon: Film,
    color: 'bg-purple-100 text-purple-600',
    keywords: ['movie', 'movies', 'cinema', 'theater', 'theatre', 'film', 'netflix', 'hulu', 'disney', 'streaming', 'show', 'concert', 'amc', 'regal']
  },
  {
    id: 'music',
    name: 'Music & Events',
    icon: Music,
    color: 'bg-pink-100 text-pink-600',
    keywords: ['music', 'spotify', 'concert', 'festival', 'band', 'gig', 'live music', 'tickets', 'show']
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: Gamepad2,
    color: 'bg-indigo-100 text-indigo-600',
    keywords: ['game', 'gaming', 'xbox', 'playstation', 'nintendo', 'steam', 'video game', 'arcade', 'esports']
  },
  {
    id: 'travel',
    name: 'Travel & Flights',
    icon: Plane,
    color: 'bg-sky-100 text-sky-600',
    keywords: ['flight', 'flights', 'airplane', 'airline', 'airport', 'travel', 'trip', 'vacation', 'holiday', 'booking', 'airbnb', 'hotel', 'hostel', 'resort']
  },
  {
    id: 'car',
    name: 'Car & Rideshare',
    icon: Car,
    color: 'bg-slate-100 text-slate-600',
    keywords: ['uber', 'lyft', 'taxi', 'cab', 'car', 'parking', 'toll', 'rental car', 'car rental', 'drive', 'driving']
  },
  {
    id: 'fuel',
    name: 'Gas & Fuel',
    icon: Fuel,
    color: 'bg-zinc-100 text-zinc-600',
    keywords: ['gas', 'fuel', 'petrol', 'diesel', 'gas station', 'shell', 'exxon', 'chevron', 'bp']
  },
  {
    id: 'transit',
    name: 'Public Transit',
    icon: Train,
    color: 'bg-blue-100 text-blue-600',
    keywords: ['train', 'metro', 'subway', 'bus', 'transit', 'rail', 'amtrak', 'public transport', 'commute']
  },
  {
    id: 'rent',
    name: 'Rent & Housing',
    icon: Home,
    color: 'bg-teal-100 text-teal-600',
    keywords: ['rent', 'housing', 'apartment', 'lease', 'mortgage', 'home', 'house', 'room', 'accommodation']
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
    keywords: ['utilities', 'electric', 'electricity', 'power', 'water', 'gas bill', 'heating', 'cooling', 'hvac']
  },
  {
    id: 'internet',
    name: 'Internet & Phone',
    icon: Wifi,
    color: 'bg-cyan-100 text-cyan-600',
    keywords: ['internet', 'wifi', 'broadband', 'cable', 'phone', 'mobile', 'cell', 'verizon', 'at&t', 't-mobile', 'comcast', 'spectrum']
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'bg-rose-100 text-rose-600',
    keywords: ['shopping', 'amazon', 'ebay', 'store', 'mall', 'buy', 'purchase', 'order', 'online shopping']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: Shirt,
    color: 'bg-violet-100 text-violet-600',
    keywords: ['clothes', 'clothing', 'shirt', 'pants', 'shoes', 'dress', 'fashion', 'apparel', 'nike', 'adidas', 'zara', 'h&m', 'uniqlo']
  },
  {
    id: 'gift',
    name: 'Gifts',
    icon: Gift,
    color: 'bg-pink-100 text-pink-600',
    keywords: ['gift', 'present', 'birthday gift', 'christmas', 'holiday gift', 'surprise']
  },
  {
    id: 'party',
    name: 'Party & Celebration',
    icon: PartyPopper,
    color: 'bg-fuchsia-100 text-fuchsia-600',
    keywords: ['party', 'celebration', 'birthday', 'anniversary', 'wedding', 'event', 'gathering']
  },
  {
    id: 'fitness',
    name: 'Fitness & Gym',
    icon: Dumbbell,
    color: 'bg-lime-100 text-lime-600',
    keywords: ['gym', 'fitness', 'workout', 'exercise', 'yoga', 'pilates', 'crossfit', 'membership', 'trainer']
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: Stethoscope,
    color: 'bg-red-100 text-red-600',
    keywords: ['doctor', 'medical', 'health', 'hospital', 'clinic', 'checkup', 'dentist', 'therapy', 'healthcare']
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: Pill,
    color: 'bg-green-100 text-green-600',
    keywords: ['pharmacy', 'medicine', 'prescription', 'drug', 'cvs', 'walgreens', 'rite aid', 'medication']
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    color: 'bg-indigo-100 text-indigo-600',
    keywords: ['education', 'school', 'college', 'university', 'tuition', 'course', 'class', 'learning', 'book', 'textbook']
  },
  {
    id: 'books',
    name: 'Books',
    icon: Book,
    color: 'bg-amber-100 text-amber-600',
    keywords: ['book', 'books', 'kindle', 'reading', 'novel', 'magazine', 'newspaper', 'library']
  },
  {
    id: 'baby',
    name: 'Baby & Kids',
    icon: Baby,
    color: 'bg-pink-100 text-pink-500',
    keywords: ['baby', 'kids', 'children', 'toys', 'diapers', 'daycare', 'childcare', 'babysitter']
  },
  {
    id: 'pets',
    name: 'Pets',
    icon: PawPrint,
    color: 'bg-orange-100 text-orange-500',
    keywords: ['pet', 'dog', 'cat', 'vet', 'veterinary', 'pet food', 'pet store', 'grooming', 'animal']
  },
  {
    id: 'grooming',
    name: 'Personal Care',
    icon: Scissors,
    color: 'bg-purple-100 text-purple-500',
    keywords: ['haircut', 'salon', 'spa', 'massage', 'grooming', 'beauty', 'nail', 'barber', 'skincare']
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: Sparkles,
    color: 'bg-cyan-100 text-cyan-500',
    keywords: ['cleaning', 'laundry', 'dry clean', 'maid', 'housekeeping', 'supplies']
  },
  {
    id: 'repairs',
    name: 'Repairs & Maintenance',
    icon: Wrench,
    color: 'bg-gray-100 text-gray-600',
    keywords: ['repair', 'fix', 'maintenance', 'plumber', 'electrician', 'handyman', 'service']
  },
  {
    id: 'outdoor',
    name: 'Outdoor & Camping',
    icon: Tent,
    color: 'bg-green-100 text-green-600',
    keywords: ['camping', 'tent', 'outdoor', 'hiking', 'backpacking', 'nature', 'park', 'trail']
  },
  {
    id: 'beach',
    name: 'Beach & Water',
    icon: Waves,
    color: 'bg-blue-100 text-blue-500',
    keywords: ['beach', 'pool', 'swimming', 'water park', 'surfing', 'snorkeling', 'diving', 'boat']
  },
  {
    id: 'winter',
    name: 'Winter Activities',
    icon: Snowflake,
    color: 'bg-sky-100 text-sky-500',
    keywords: ['ski', 'skiing', 'snowboard', 'snow', 'winter', 'ice skating', 'sledding']
  },
  {
    id: 'tickets',
    name: 'Tickets & Events',
    icon: Ticket,
    color: 'bg-violet-100 text-violet-500',
    keywords: ['ticket', 'tickets', 'event', 'admission', 'entry', 'pass', 'museum', 'attraction', 'theme park']
  },
  {
    id: 'bills',
    name: 'Bills & Fees',
    icon: Receipt,
    color: 'bg-slate-100 text-slate-500',
    keywords: ['bill', 'fee', 'payment', 'subscription', 'membership', 'due', 'charge']
  },
  {
    id: 'other',
    name: 'Other',
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-500',
    keywords: []
  }
];

/**
 * Detects the expense category based on the description
 * @param {string} description - The expense description
 * @returns {object} - The matched category object
 */
export function detectExpenseCategory(description) {
  if (!description) {
    return expenseCategories.find(c => c.id === 'other');
  }
  
  const lowerDesc = description.toLowerCase().trim();
  
  // Try to find a matching category based on keywords
  for (const category of expenseCategories) {
    for (const keyword of category.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // If no match found, return 'other' category
  return expenseCategories.find(c => c.id === 'other');
}

/**
 * Get category by ID
 * @param {string} categoryId - The category ID
 * @returns {object} - The category object
 */
export function getCategoryById(categoryId) {
  return expenseCategories.find(c => c.id === categoryId) || expenseCategories.find(c => c.id === 'other');
}

/**
 * Get all available categories (for manual selection)
 * @returns {array} - Array of category objects
 */
export function getAllCategories() {
  return expenseCategories;
}
