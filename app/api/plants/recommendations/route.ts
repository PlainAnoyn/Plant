import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plant from '@/models/Plant';

// Get product recommendations based on category
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const exclude = searchParams.get('exclude'); // Plant ID to exclude
    const limit = parseInt(searchParams.get('limit') || '4');

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    let query: any = {
      category: category,
      stock: { $gt: 0 }, // Only show in-stock items
    };

    // Exclude the current plant
    if (exclude) {
      query._id = { $ne: exclude };
    }

    // Get recommended plants from the same category
    const recommendedPlants = await Plant.find(query)
      .sort({ createdAt: -1 }) // Show newest first
      .limit(limit * 2) // Get more than needed
      .lean();

    // If we don't have enough from the same category, fill with other categories
    if (recommendedPlants.length < limit) {
      const otherCategoryQuery: any = {
        stock: { $gt: 0 },
      };
      
      if (exclude) {
        otherCategoryQuery._id = { $ne: exclude };
      }
      
      // Exclude the current category
      if (category) {
        otherCategoryQuery.category = { $ne: category };
      }

      const otherPlants = await Plant.find(otherCategoryQuery)
        .sort({ createdAt: -1 })
        .limit(limit - recommendedPlants.length)
        .lean();

      recommendedPlants.push(...otherPlants);
    }

    // Shuffle and limit to requested amount
    const shuffled = recommendedPlants.sort(() => Math.random() - 0.5);
    const finalRecommendations = shuffled.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: finalRecommendations.map((plant) => ({
        _id: plant._id.toString(),
        name: plant.name,
        price: plant.price,
        category: plant.category,
        imageUrl: plant.imageUrl,
        stock: plant.stock,
      })),
    });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}


