import { Link } from 'react-router-dom';

export default function VerifyEmail() {
  return (
    <div className="flex flex-col justify-center py-12 min-h-screen bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          Check your email
        </h2>
        <div className="px-4 py-8 mt-8 bg-white shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              If you don't see the email, check your spam folder.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="flex justify-center px-4 py-2 w-full text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
