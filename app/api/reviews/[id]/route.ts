import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Review from '@/models/Review';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

// NAYA: Params ko ab Promise ki tarah define karna hota hai Next.js 15+ me
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // NAYA: params ko await karna zaroori hai
    const { id } = await params;
    const body = await req.json();
    
    const updatedReview = await Review.findByIdAndUpdate(
      id, 
      { isApproved: body.isApproved }, 
      { returnDocument: 'after' } // Mongoose ki warning hatane ke liye
    );

    if (!updatedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    console.error('Update Review Error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // NAYA: params ko await karna zaroori hai
    const { id } = await params;
    
    const deletedReview = await Review.findByIdAndDelete(id);
    
    if (!deletedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Review Error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}