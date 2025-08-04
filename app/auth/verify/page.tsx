'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Verify() {
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();

  useEffect(() => {
    // Check if the user has verified their email
    const checkVerification = async () => {
      try {
        // You can add additional verification logic here if needed
        setMessage('Please check your email for the verification link.');
      } catch (error) {
        setMessage('An error occurred during verification.');
      }
    };

    checkVerification();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center border border-sidebar-border">
      <div className="max-w-md w-full space-y-8 p-8 bg-sidebar rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold  text-primary">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{message}</p>
        </div>
        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
} 