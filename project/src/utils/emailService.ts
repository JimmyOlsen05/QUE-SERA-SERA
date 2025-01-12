import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

export interface EmailData {
  to_email: string;
  to_name: string;
  verification_link: string;
}

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<boolean> => {
  const verificationLink = `${window.location.origin}/auth/verify-email?token=${verificationToken}`;

  const templateParams = {
    to_email: email,
    to_name: email.split('@')[0], // Use part before @ as name
    verification_link: verificationLink,
  };

  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

export const generateVerificationToken = (email: string): string => {
  // Create a token using timestamp, email, and a random string
  const timestamp = Date.now().toString(36);
  const emailHash = Buffer.from(email).toString('base64');
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}.${emailHash}.${randomStr}`;
};

export const verifyEmailToken = (token: string): string | null => {
  try {
    const [timestamp, emailHash, _] = token.split('.');
    const email = Buffer.from(emailHash, 'base64').toString();
    
    // Check if token is not older than 24 hours
    const tokenDate = parseInt(timestamp, 36);
    if (Date.now() - tokenDate > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return email;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};
