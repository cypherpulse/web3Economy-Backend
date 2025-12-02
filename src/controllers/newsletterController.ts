import { Request, Response } from 'express';
import { NewsletterSubscriber } from '../models';
import { sendEmail } from '../services/emailService';
import { IApiResponse, INewsletterSubscribeRequest, INewsletterUnsubscribeRequest } from '../types';

// Subscribe to newsletter (public)
export const subscribe = async (
  req: Request<object, object, INewsletterSubscribeRequest>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { email, source } = req.body;

    // Validate email
    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required.',
        },
      });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a valid email address.',
        },
      });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter.',
        });
        return;
      }

      // Reactivate subscription
      existingSubscriber.status = 'active';
      existingSubscriber.subscribedAt = new Date();
      existingSubscriber.unsubscribedAt = undefined;
      existingSubscriber.source = source || existingSubscriber.source;
      await existingSubscriber.save();

      // Send welcome back email
      try {
        await sendEmail({
          to: normalizedEmail,
          subject: 'Welcome back to Web3 Economy Newsletter!',
          html: `
            <h2>Welcome back!</h2>
            <p>You have been re-subscribed to the Web3 Economy newsletter.</p>
            <p>Stay tuned for the latest updates in the Web3 ecosystem!</p>
            <hr>
            <p><small>If you didn't request this, you can <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}">unsubscribe here</a>.</small></p>
          `,
        });
      } catch (err) {
        console.error('Error sending welcome back email:', err);
      }

      res.status(200).json({
        success: true,
        message: 'Successfully re-subscribed to newsletter.',
      });
      return;
    }

    // Create new subscriber
    const subscriber = new NewsletterSubscriber({
      email: normalizedEmail,
      source: source || 'direct',
      status: 'active',
    });

    await subscriber.save();

    // Send welcome email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to Web3 Economy Newsletter!',
        html: `
          <h2>Welcome to Web3 Economy!</h2>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>You'll receive the latest updates on:</p>
          <ul>
            <li>Upcoming Web3 events and conferences</li>
            <li>New creator spotlights and features</li>
            <li>Latest builder projects and innovations</li>
            <li>Educational resources and tutorials</li>
          </ul>
          <p>Stay connected with the Web3 community!</p>
          <hr>
          <p><small>If you didn't subscribe, you can <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}">unsubscribe here</a>.</small></p>
        `,
      });
    } catch (err) {
      console.error('Error sending welcome email:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter.',
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBSCRIBE_ERROR',
        message: 'Failed to subscribe to newsletter. Please try again later.',
      },
    });
  }
};

// Unsubscribe from newsletter (public)
export const unsubscribe = async (
  req: Request<object, object, INewsletterUnsubscribeRequest>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required.',
        },
      });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    const subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

    if (!subscriber) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Email not found in our newsletter list.',
        },
      });
      return;
    }

    if (subscriber.status === 'unsubscribed') {
      res.status(200).json({
        success: true,
        message: 'You are already unsubscribed from our newsletter.',
      });
      return;
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    // Send confirmation email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'You have been unsubscribed from Web3 Economy Newsletter',
        html: `
          <h2>Unsubscription Confirmed</h2>
          <p>You have been successfully unsubscribed from the Web3 Economy newsletter.</p>
          <p>We're sorry to see you go! If you change your mind, you can always subscribe again.</p>
          <p><a href="${process.env.FRONTEND_URL}/subscribe">Re-subscribe</a></p>
        `,
      });
    } catch (err) {
      console.error('Error sending unsubscribe confirmation:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter.',
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UNSUBSCRIBE_ERROR',
        message: 'Failed to unsubscribe from newsletter. Please try again later.',
      },
    });
  }
};

// Get all subscribers (admin only)
export const getSubscribers = async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};
    if (status) {
      query.status = status;
    }

    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find(query)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      NewsletterSubscriber.countDocuments(query),
    ]);

    res.setHeader('X-Total-Count', total.toString());

    res.json({
      success: true,
      data: {
        subscribers,
        total,
        activeCount: await NewsletterSubscriber.countDocuments({ status: 'active' }),
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch subscribers.',
      },
    });
  }
};

// Delete subscriber (admin only)
export const deleteSubscriber = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);

    if (!subscriber) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Subscriber not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Subscriber deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete subscriber.',
      },
    });
  }
};
