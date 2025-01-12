import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface NotificationData {
  title: string;
  message: string;
  type: 'request_accepted' | 'interview_scheduled' | 'project_approved';
  metadata?: Record<string, any>;
}

const formatEmailMessage = (data: NotificationData): string => {
  switch (data.type) {
    case 'request_accepted':
      return `
        <p>Hello!</p>
        <p>Great news! Your request to join the project "${data.metadata?.projectTitle}" has been accepted.</p>
        <p>The project admin will schedule an interview with you soon to discuss your role and responsibilities.</p>
        <p>You'll receive another notification when the interview is scheduled.</p>
        <br>
        <p>Best regards,</p>
        <p>The U-Connect Team</p>
      `;

    case 'interview_scheduled':
      return `
        <p>Hello!</p>
        <p>An interview has been scheduled for your request to join "${data.metadata?.projectTitle}".</p>
        <p><strong>Interview Details:</strong></p>
        <ul>
          <li>Date: ${new Date(data.metadata?.interviewDate).toLocaleDateString()}</li>
          <li>Time: ${new Date(data.metadata?.interviewDate).toLocaleTimeString()}</li>
          <li>Location: ${data.metadata?.location}</li>
          ${data.metadata?.notes ? `<li>Additional Notes: ${data.metadata.notes}</li>` : ''}
        </ul>
        <p>Please make sure to be on time for the interview.</p>
        <br>
        <p>Best regards,</p>
        <p>The U-Connect Team</p>
      `;

    case 'project_approved':
      return `
        <p>Hello!</p>
        <p>Congratulations! 🎉</p>
        <p>We're excited to inform you that you have been approved to join the project "${data.metadata?.projectTitle}".</p>
        <p>You can now access all project resources and start collaborating with the team.</p>
        <br>
        <p>Best regards,</p>
        <p>The U-Connect Team</p>
      `;

    default:
      return data.message;
  }
};

export const createNotification = async (
  userId: string,
  data: NotificationData
): Promise<boolean> => {
  try {
    // Create notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: data.title,
        message: data.message,
        type: data.type,
        metadata: data.metadata,
        read: false
      });

    if (notificationError) throw notificationError;

    // Get user's email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    try {
      // Try to send email using Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: userData.email,
          subject: data.title,
          message: formatEmailMessage(data)
        }
      });

      if (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't throw error, just log it
      }
    } catch (emailError) {
      console.warn('Email service unavailable:', emailError);
      // Don't throw error, continue with in-app notification
    }

    // Show success toast for in-app notification
    toast.success('Notification sent');
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    toast.error('Failed to send notification');
    return false;
  }
};

export const notifyRequestAccepted = async (
  userId: string,
  projectTitle: string
) => {
  return createNotification(userId, {
    title: 'Project Request Accepted',
    message: `Your request to join "${projectTitle}" has been accepted! The project admin will schedule an interview with you soon.`,
    type: 'request_accepted',
    metadata: { projectTitle }
  });
};

export const notifyInterviewScheduled = async (
  userId: string,
  projectTitle: string,
  interviewDate: Date,
  location: string,
  notes?: string
) => {
  return createNotification(userId, {
    title: 'Interview Scheduled',
    message: `An interview has been scheduled for your request to join "${projectTitle}".`,
    type: 'interview_scheduled',
    metadata: {
      projectTitle,
      interviewDate: interviewDate.toISOString(),
      location,
      notes
    }
  });
};

export const notifyProjectApproved = async (
  userId: string,
  projectTitle: string
) => {
  return createNotification(userId, {
    title: 'Project Request Approved',
    message: `Congratulations! You have been approved to join "${projectTitle}" after your successful interview.`,
    type: 'project_approved',
    metadata: { projectTitle }
  });
};
