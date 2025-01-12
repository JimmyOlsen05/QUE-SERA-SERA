const testEmail = async () => {
  try {
    console.log('Sending test email...');
    const response = await fetch('https://tsdqpvmpvwspzvognqei.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZHFwdm1wdndzcHp2b2ducWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzOTQ1MzYsImV4cCI6MjA1MDk3MDUzNn0.Tvg9Xeyqd5K-gycgdlzmmzNmI_SpqzB0s7K2uoYN-PQ`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'recyclips21@gmail.com',
        subject: 'Test Email from Supabase Function',
        message: 'This is a test email sent from the Supabase Edge Function!'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error testing email:', error);
    throw error;
  }
};

export default testEmail;
