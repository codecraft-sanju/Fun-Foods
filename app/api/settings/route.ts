// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import StoreSettings from '../../../models/StoreSettings';

// Delivery charges fetch karne ke liye
export async function GET() {
  try {
    await connectToDatabase();
    
    // Check karte hain agar database me pehle se settings hain ya nahi
    let settings = await StoreSettings.findOne();
    
    // Agar first time run ho raha hai, toh default (50 aur 80) save kar do
    if (!settings) {
      settings = await StoreSettings.create({ localCharge: 50, gaovCharge: 80 });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// Admin panel se delivery charges update karne ke liye
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create(body);
    } else {
      settings.localCharge = body.localCharge;
      settings.gaovCharge = body.gaovCharge;
      await settings.save();
    }
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}