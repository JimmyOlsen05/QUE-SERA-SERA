import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize SMTP client
const client = new SmtpClient();

const sendEmail = async (to: string, subject: string, message: string) => {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Checking environment variables...');
    const username = Deno.env.get('SMTP_USERNAME');
    const password = Deno.env.get('SMTP_PASSWORD');
    const fromEmail = Deno.env.get('FROM_EMAIL');
    const hostname = Deno.env.get('SMTP_HOSTNAME');

    if (!username || !password || !fromEmail || !hostname) {
      throw new Error('Missing required environment variables');
    }

    console.log('Connecting to SMTP server...');
    // Configure connection to DNSExit SMTP server
    await client.connectTLS({
      hostname: hostname,
      port: 587, // Using STARTTLS port
      username: username,
      password: password,
      tls: true,
    });

    console.log('Sending email...');
    // Send email
    await client.send({
      from: fromEmail,
      to: to,
      subject: subject,
      html: message,
    });

    console.log('Email sent successfully!');
    // Close the connection
    await client.close();
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error in sendEmail:', error);
    // Make sure to close the connection on error
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing SMTP connection:', closeError);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      throw new Error('Missing required fields');
    }

    const result = await sendEmail(to, subject, message);

    return new Response(
      JSON.stringify(result),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});