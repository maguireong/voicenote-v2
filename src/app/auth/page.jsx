"use client"

import { signinWithGoogle } from '../../clients/actions';

const Page = () => {
    return <form className="flex justify-center">
      <button
        formAction={signinWithGoogle}
        type="submit"
        className="flex items-center justify-center bg-white text-gray-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-gray-300"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png"
          alt="Google Logo"
          className="w-6 h-6 mr-3"
        />
        Sign in with Google
      </button>
    </form>
}

export default Page