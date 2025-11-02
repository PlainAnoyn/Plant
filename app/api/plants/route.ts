import { NextRequest, NextResponse } from 'next/server';

// Mock plant data - replace with MongoDB later
const mockPlants = [
  {
    _id: '1',
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
    _id: '2',
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
    _id: '3',
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
    _id: '4',
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
    _id: '5',
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
    _id: '6',
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
    _id: '7',
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
    _id: '8',
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
    _id: '9',
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
    _id: '10',
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
    _id: '11',
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
    _id: '12',
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

export async function GET(request: NextRequest) {
  try {
    // Try to connect to MongoDB first
    let plants = [];
    let useMock = false;

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const Plant = (await import('@/models/Plant')).default;
      
      await connectDB();
      const searchParams = request.nextUrl.searchParams;
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '12');
      const skip = (page - 1) * limit;

      let query: any = {};
      
      if (category && category !== 'All') {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const dbPlants = await Plant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Plant.countDocuments(query);

      return NextResponse.json({
        success: true,
        data: dbPlants,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (dbError) {
      // If MongoDB fails, use mock data
      useMock = true;
      console.log('Using mock data - MongoDB not available');
    }

    if (useMock) {
      const searchParams = request.nextUrl.searchParams;
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '12');
      const skip = (page - 1) * limit;

      let filteredPlants = [...mockPlants];

      // Filter by category
      if (category && category !== 'All') {
        filteredPlants = filteredPlants.filter((plant) => plant.category === category);
      }

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPlants = filteredPlants.filter(
          (plant) =>
            plant.name.toLowerCase().includes(searchLower) ||
            plant.description.toLowerCase().includes(searchLower)
        );
      }

      const total = filteredPlants.length;
      const paginatedPlants = filteredPlants.slice(skip, skip + limit);

      return NextResponse.json({
        success: true,
        data: paginatedPlants,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const Plant = (await import('@/models/Plant')).default;
    
    await connectDB();
    const body = await request.json();
    
    const plant = await Plant.create(body);
    
    return NextResponse.json(
      { success: true, data: plant },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
