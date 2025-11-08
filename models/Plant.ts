import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlant extends Document {
  name: string;
  description: string;
  price: number;
  discountPercentage?: number;
  category: string;
  imageUrl: string;
  stock: number;
  isFeatured?: boolean;
  isFreeDelivery?: boolean;
  careInstructions?: string;
  sunlight?: string;
  water?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Plant name is required'],
      trim: true,
      maxlength: [100, 'Plant name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isFreeDelivery: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Indoor', 'Outdoor', 'Succulent', 'Flowering', 'Herb', 'Tree', 'Shrub', 'Other'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    careInstructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Care instructions cannot exceed 500 characters'],
    },
    sunlight: {
      type: String,
      enum: ['Full Sun', 'Partial Sun', 'Shade', 'Indirect Light'],
      trim: true,
    },
    water: {
      type: String,
      enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Low'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Plant: Model<IPlant> = mongoose.models.Plant || mongoose.model<IPlant>('Plant', PlantSchema);

export default Plant;

