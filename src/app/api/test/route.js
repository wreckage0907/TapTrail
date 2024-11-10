// src/app/api/test/route.js
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testRef = await addDoc(collection(db, 'test'), {
      message: 'Test connection',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful',
      docId: testRef.id
    });
  } catch (error) {
    console.error('Firebase test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}