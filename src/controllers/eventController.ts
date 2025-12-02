import { Request, Response } from 'express';
import { Event } from '../models';
import { AuthRequest } from '../middleware';
import { IApiResponse, IEventQueryParams } from '../types';

// Get all events (public)
export const getEvents = async (
  req: Request<object, object, object, IEventQueryParams>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ date: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(query),
    ]);

    // Set pagination headers before sending response
    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', limit.toString());

    res.json({
      success: true,
      data: events,
      message: `Found ${events.length} events`,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch events.',
      },
    });
  }
};

// Get single event by ID (public)
export const getEvent = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch event.',
      },
    });
  }
};

// Create event (admin only)
export const createEvent = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const eventData = req.body;

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create event.',
      },
    });
  }
};

// Update event (admin only)
export const updateEvent = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!event) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update event.',
      },
    });
  }
};

// Delete event (admin only)
export const deleteEvent = async (
  req: AuthRequest,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete event.',
      },
    });
  }
};
