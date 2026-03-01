import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Review from '@/models/Review';

// DB Connect function (Stronger setup)
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }
};

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    let reviews;
    if (isAdmin) {
      // Admin ko saare reviews dikhenge
      reviews = await Review.find({}).sort({ createdAt: -1 });
    } else {
      // Normal users ko sirf approved reviews dikhenge
      reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // NAYA CHANGE YAHAN HAI: 
    // isApproved ko direct 'true' set kar diya gaya hai. 
    // Isse review bina admin permission ke turant live ho jayega.
    const newReview = await Review.create({ ...body, isApproved: true });
    
    return NextResponse.json({ success: true, message: 'Review submitted and live successfully', review: newReview }, { status: 201 });
  } catch (error) {
    console.error('Submit Review Error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}