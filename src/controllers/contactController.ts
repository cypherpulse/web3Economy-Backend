import { Request, Response } from 'express';
import { ContactSubmission, NewsletterSubscriber } from '../models';
import { sendEmail } from '../services/emailService';
import { IApiResponse, IContactSubmissionRequest } from '../types';

// Submit contact form (public)
export const submitContactForm = async (
  req: Request<object, object, IContactSubmissionRequest>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { fullName, email, company, subject, message, subscribeNewsletter } = req.body;

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Full name, email, subject, and message are required.',
        },
      });
      return;
    }

    // Validate email format
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

    // Create contact submission
    const contactSubmission = new ContactSubmission({
      fullName,
      email: email.toLowerCase(),
      company,
      subject,
      message,
      subscribeNewsletter: subscribeNewsletter || false,
    });

    await contactSubmission.save();

    // If user opted to subscribe to newsletter
    if (subscribeNewsletter) {
      try {
        const existingSubscriber = await NewsletterSubscriber.findOne({
          email: email.toLowerCase(),
        });

        if (!existingSubscriber) {
          const subscriber = new NewsletterSubscriber({
            email: email.toLowerCase(),
            source: 'contact_form',
            status: 'active',
          });
          await subscriber.save();
        } else if (existingSubscriber.status === 'unsubscribed') {
          existingSubscriber.status = 'active';
          existingSubscriber.subscribedAt = new Date();
          existingSubscriber.unsubscribedAt = undefined;
          await existingSubscriber.save();
        }
      } catch (err) {
        console.error('Error adding to newsletter:', err);
        // Don't fail the contact form submission if newsletter subscription fails
      }
    }

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER!,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${fullName} (${email})</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p><strong>Newsletter Subscription:</strong> ${subscribeNewsletter ? 'Yes' : 'No'}</p>
          <hr>
          <p><small>Submitted at: ${new Date().toISOString()}</small></p>
        `,
      });
    } catch (err) {
      console.error('Error sending notification email:', err);
      // Don't fail the submission if email sending fails
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        subject: 'Thank you for contacting Web3 Economy',
        html: `
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${fullName},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <blockquote>${message.replace(/\n/g, '<br>')}</blockquote>
          <p>Best regards,<br>The Web3 Economy Team</p>
        `,
      });
    } catch (err) {
      console.error('Error sending confirmation email:', err);
      // Don't fail the submission if email sending fails
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMIT_ERROR',
        message: 'Failed to submit contact form. Please try again later.',
      },
    });
  }
};

// Get all contact submissions (admin only)
export const getContactSubmissions = async (
  req: Request,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [submissions, total] = await Promise.all([
      ContactSubmission.find()
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ContactSubmission.countDocuments(),
    ]);

    res.setHeader('X-Total-Count', total.toString());

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch contact submissions.',
      },
    });
  }
};

// Get single contact submission (admin only)
export const getContactSubmission = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const submission = await ContactSubmission.findById(id);

    if (!submission) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact submission not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch contact submission.',
      },
    });
  }
};

// Delete contact submission (admin only)
export const deleteContactSubmission = async (
  req: Request<{ id: string }>,
  res: Response<IApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const submission = await ContactSubmission.findByIdAndDelete(id);

    if (!submission) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact submission not found.',
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete contact submission.',
      },
    });
  }
};
