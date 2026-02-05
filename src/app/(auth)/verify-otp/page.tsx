import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; // Import the redirect utility
import OtpPage from './OtpForm';
const Page = async () => {
  const cookiesList = await cookies();
  const verificationCookie = cookiesList.get("verificationToken");
  if (!verificationCookie) {
    redirect('/login');
  }

  return (
    <OtpPage/>
  );
};

export default Page;