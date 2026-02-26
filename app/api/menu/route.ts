import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import MenuItem from '../../../models/MenuItem';

// Saare menu items fetch karne ke liye (Fast Load)
export async function GET() {
  try {
    await connectToDatabase();
    const items = await MenuItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// Admin panel se naya item add karne ke liye
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const newItem = await MenuItem.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}