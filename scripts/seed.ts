import connectDB from './lib/mongodb';
import Plant from './models/Plant';

const samplePlants = [
  {
    name: 'Monstera Deliciosa',
    description: 'A beautiful tropical plant with large, glossy leaves that have natural holes. Perfect for indoor spaces.',
    price: 29.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1519336056116-9e7e0b82d6e9?w=800&h=600&fit=crop',
    stock: 15,
    sunlight: 'Indirect Light',
    water: 'Weekly',
    careInstructions: 'Keep in bright, indirect light. Water when top inch of soil is dry. Mist leaves occasionally.',
  },
  {
    name: 'Snake Plant',
    description: 'A hardy, low-maintenance plant perfect for beginners. Known for its air-purifying qualities.',
    price: 19.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800&h=600&fit=crop',
    stock: 25,
    sunlight: 'Indirect Light',
    water: 'Monthly',
    careInstructions: 'Very low maintenance. Water sparingly, about once a month. Tolerates low light.',
  },
  {
    name: 'Pothos Golden',
    description: 'A trailing vine plant with heart-shaped leaves. Great for hanging baskets or shelves.',
    price: 14.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1593691509546-89fc12097a99?w=800&h=600&fit=crop',
    stock: 30,
    sunlight: 'Indirect Light',
    water: 'Weekly',
    careInstructions: 'Easy to care for. Water when soil feels dry. Can thrive in various light conditions.',
  },
  {
    name: 'Lavender',
    description: 'Fragrant purple flowers that attract pollinators. Perfect for outdoor gardens.',
    price: 12.99,
    category: 'Outdoor',
    imageUrl: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=600&fit=crop',
    stock: 20,
    sunlight: 'Full Sun',
    water: 'Weekly',
    careInstructions: 'Needs full sun and well-drained soil. Water regularly but avoid overwatering.',
  },
  {
    name: 'Aloe Vera',
    description: 'Succulent plant known for its medicinal properties. Low maintenance and easy to grow.',
    price: 9.99,
    category: 'Succulent',
    imageUrl: 'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=800&h=600&fit=crop',
    stock: 40,
    sunlight: 'Partial Sun',
    water: 'Bi-weekly',
    careInstructions: 'Very low maintenance. Water deeply but infrequently. Prefers bright light.',
  },
  {
    name: 'Rose Bush',
    description: 'Classic flowering shrub with beautiful blooms. Available in various colors.',
    price: 24.99,
    category: 'Flowering',
    imageUrl: 'https://images.unsplash.com/photo-1518621012428-4ef4c1ee3387?w=800&h=600&fit=crop',
    stock: 12,
    sunlight: 'Full Sun',
    water: 'Weekly',
    careInstructions: 'Needs full sun and regular watering. Prune regularly for best blooms.',
  },
  {
    name: 'Basil',
    description: 'Fresh herb perfect for cooking. Grow your own herbs at home!',
    price: 7.99,
    category: 'Herb',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800&h=600&fit=crop',
    stock: 35,
    sunlight: 'Full Sun',
    water: 'Daily',
    careInstructions: 'Keep soil moist. Pinch flowers to encourage leaf growth. Harvest regularly.',
  },
  {
    name: 'Jade Plant',
    description: 'Beautiful succulent with thick, glossy leaves. Symbol of good luck and prosperity.',
    price: 16.99,
    category: 'Succulent',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=600&fit=crop',
    stock: 18,
    sunlight: 'Partial Sun',
    water: 'Bi-weekly',
    careInstructions: 'Water when soil is completely dry. Prefers bright, indirect light.',
  },
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing plants
    await Plant.deleteMany({});
    console.log('Cleared existing plants');

    // Insert sample plants
    const insertedPlants = await Plant.insertMany(samplePlants);
    console.log(`Successfully inserted ${insertedPlants.length} plants`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

