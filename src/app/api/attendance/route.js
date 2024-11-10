// src/app/api/attendance/route.js
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { Name, UID, Time } = body;
    
    if (!Name || !UID || !Time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const attendanceRef = collection(db, 'attendance');
    const docRef = await addDoc(attendanceRef, {
      name: Name,
      uid: UID,
      timestamp: Time,
      date: new Date(Time).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      { id: docRef.id, message: 'Attendance recorded successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const days = parseInt(searchParams.get('days') || '7');
    
    let q;
    
    if (date) {
      // Query for specific date
      q = query(
        collection(db, 'attendance'),
        where('date', '==', date),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Query for last X days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      q = query(
        collection(db, 'attendance'),
        where('timestamp', '>=', startDate.toISOString()),
        orderBy('timestamp', 'desc'),
        limit(1000) // Reasonable limit to prevent overloading
      );
    }
    
    const querySnapshot = await getDocs(q);
    const attendanceData = [];
    
    querySnapshot.forEach((doc) => {
      attendanceData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return NextResponse.json({
      success: true,
      data: attendanceData,
      count: attendanceData.length,
      params: { date, days }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance', details: error.message },
      { status: 500 }
    );
  }
}