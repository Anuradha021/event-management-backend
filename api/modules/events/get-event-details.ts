import { Request, Response } from 'express';
import { db } from '../../config/firebase';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;
    
    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const doc = await db.collection('events').doc(eventId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const eventData = doc.data();
    const formattedData = {
      id: doc.id,
      ...eventData,
      eventDate: eventData?.eventDate?.toDate?.()?.toISOString?.(),
      createdAt: eventData?.createdAt?.toDate?.()?.toISOString?.(),
      updatedAt: eventData?.updatedAt?.toDate?.()?.toISOString?.(),
    };

    return res.status(200).json({
      success: true,
      data: formattedData
    });

  } catch (error: any) {
    console.error('Error fetching event details:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch event details'
    });
  }
}