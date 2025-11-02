// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules that use process.env
import connectDB from '../lib/mongodb';
import Plant from '../models/Plant';
import { uploadImage } from '../lib/cloudinary';

const samplePlants = [
  {
    name: 'Monstera Deliciosa',
    description: 'A beautiful tropical plant with large, glossy leaves that have natural holes. Perfect for indoor spaces.',
    price: 29.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1519336056116-9e7e0b82d6e9?w=800&h=800&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800&h=800&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1593691509546-89fc12097a99?w=800&h=800&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=800&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=800&h=800&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1518621012428-4ef4c1ee3387?w=800&h=800&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800&h=800&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=800&fit=crop&q=80',
    stock: 18,
    sunlight: 'Partial Sun',
    water: 'Bi-weekly',
    careInstructions: 'Water when soil is completely dry. Prefers bright, indirect light.',
  },
  {
    name: 'Fiddle Leaf Fig',
    description: 'Stunning indoor tree with large, violin-shaped leaves. A statement piece for any room.',
    price: 34.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=800&fit=crop&q=80',
    stock: 10,
    sunlight: 'Indirect Light',
    water: 'Weekly',
    careInstructions: 'Prefers bright, indirect light. Water when top 2 inches of soil are dry. Avoid overwatering.',
  },
  {
    name: 'Rubber Plant',
    description: 'Beautiful dark green leaves with a glossy finish. Great air purifier and easy to care for.',
    price: 22.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1595322917960-99559b3e0e1c?w=800&h=800&fit=crop&q=80',
    stock: 20,
    sunlight: 'Indirect Light',
    water: 'Weekly',
    careInstructions: 'Water when soil feels dry. Wipe leaves occasionally to keep them shiny.',
  },
  {
    name: 'ZZ Plant',
    description: 'Extremely low maintenance plant that thrives in low light. Perfect for beginners.',
    price: 18.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop&q=80',
    stock: 28,
    sunlight: 'Indirect Light',
    water: 'Monthly',
    careInstructions: 'Very drought tolerant. Water every 2-3 weeks. Can survive in low light conditions.',
  },
  {
    name: 'Peace Lily',
    description: 'Elegant white flowers and air-purifying qualities. Perfect for darker corners.',
    price: 21.99,
    category: 'Indoor',
    imageUrl: 'https://images.unsplash.com/photo-1593691509256-0b3015b7c9b3?w=800&h=800&fit=crop&q=80',
    stock: 22,
    sunlight: 'Shade',
    water: 'Weekly',
    careInstructions: 'Keep soil moist but not soggy. Prefers low to medium light. Perfect for bathrooms.',
  },
];

async function seedDatabase() {
  try {
    // Check MongoDB URI
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      console.error('');
      console.error('❌ MongoDB Atlas not configured!');
      console.error('');
      console.error('Please set up MongoDB Atlas:');
      console.error('1. Go to https://www.mongodb.com/cloud/atlas/register');
      console.error('2. Create a free cluster');
      console.error('3. Get your connection string');
      console.error('4. Update MONGODB_URI in .env.local');
      console.error('');
      console.error('Current MONGODB_URI:', mongoUri || 'Not set');
      console.error('');
      console.error('See CLOUD_SETUP.md for detailed instructions');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_API_KEY && 
                         process.env.CLOUDINARY_API_SECRET;

    if (useCloudinary) {
      console.log('✓ Cloudinary configured - uploading images to cloud storage...');
    } else {
      console.log('⚠ Cloudinary not configured - using direct image URLs');
    }

    // Clear existing plants
    await Plant.deleteMany({});
    console.log('✓ Cleared existing plants');

    // Process plants - upload to Cloudinary if configured
    const plantsToInsert = [];
    
    for (const plant of samplePlants) {
      let imageUrl = plant.imageUrl;
      
      if (useCloudinary) {
        try {
          console.log(`  Uploading image for ${plant.name}...`);
          imageUrl = await uploadImage(plant.imageUrl, 'plant-images');
          console.log(`  ✓ Uploaded: ${plant.name}`);
        } catch (error) {
          console.error(`  ⚠ Failed to upload ${plant.name}, using original URL`);
          // Keep original URL if upload fails
        }
      }
      
      plantsToInsert.push({
        ...plant,
        imageUrl,
      });
    }

    // Insert plants
    const insertedPlants = await Plant.insertMany(plantsToInsert);
    console.log(`✓ Successfully inserted ${insertedPlants.length} plants`);

    if (useCloudinary) {
      console.log('\n✓ All images uploaded to Cloudinary cloud storage!');
    }

    process.exit(0);
  } catch (error: any) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
