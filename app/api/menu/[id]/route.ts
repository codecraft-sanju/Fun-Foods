import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import MenuItem from '../../../../models/MenuItem';

// NAYA: Next.js 16 ke liye Promise<{ id: string }> aur await params add kiya hai
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await connectToDatabase();
    await MenuItem.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    await connectToDatabase();
    
    const updatedItem = await MenuItem.findByIdAndUpdate(resolvedParams.id, body, { new: true });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}