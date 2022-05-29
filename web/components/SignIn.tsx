import { LockClosedIcon, MailIcon } from "@heroicons/react/solid"
import Link from "next/link"
import axios from "axios"
import { useEffect, useState } from "react"
import { getOrgFromSubdomainForAuth, getSubdomain, OrgForAuth } from "../helpers/user"
import Head from "next/head"

export default function SignIn() {
  const [orgForAuth, setOrgForAuth] = useState<OrgForAuth>();
  const [email, setEmail] = useState("")
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | undefined>(undefined)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const subdomain = getSubdomain(window.location.host);
    getOrgFromSubdomainForAuth(subdomain)
      .then((org: OrgForAuth) => {
        if (org) {
          setOrgForAuth(org);
        }
      })
  }, []);

  if (orgForAuth == null) {
    return <>
      <Head>
        <title>Mintlify | Continuous Documentation Platform</title>
      </Head>
    <div className="fixed inset-0 bg-gray-50"></div>
    </>
  }

  const onSubmit = () => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim()) || email.trim() === "") {
      setEmailErrorMessage("Please enter a valid email address.")
      return
    }

    axios.post("/api/login/magiclink", { email })
    setIsSubmitted(true)
  }

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={orgForAuth.favicon} type="image/x-icon" />
        <title>Sign in to {orgForAuth.name}</title>
      </Head>
      <div className="min-h-screen flex items-center bg-gray-50 justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md bg-white border border-gray-300 drop-shadow-sm w-full rounded-lg py-12 px-8">
          <div>
            <img className="h-8" src="/assets/mintlify.svg" alt="Mintlify" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Need a new organization?{' '}
              <Link href="https://1tc7vihvbit.typeform.com/to/ZUY3igg4">
                <a target="_blank" className="font-medium text-primary">
                  Sign up
                </a>
              </Link>
              {' '}here
            </p>
          </div>
          {isSubmitted && (
            <div className="mt-6 rounded-md bg-green-200 px-4 py-3">
              <div className="flex justify-center items-center">
                <div className="flex-shrink-0">
                  <MailIcon className="h-5 w-5 text-green-800" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Confirmation email sent to {email}</p>
                </div>
              </div>
            </div>
          )}
          {!isSubmitted && (
            <div className="mt-6">
              <div className="grid grid-cols-1">
                <Link href="/api/login/github">
                  <div className="w-full inline-flex space-x-2 justify-center py-2 px-4  rounded-md shadow-sm border border-gray-500 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <span className="sr-only">Sign in with GitHub</span>
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>Sign in with GitHub</p>
                  </div>
                </Link>
              </div>
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              <form className="mt-8 space-y-4" action="#" method="POST">
                <input type="hidden" name="remember" defaultValue="true" />
                <div className="rounded-md space-y-px">
                  <div className="shadow-sm">
                    <label htmlFor="email-address" className="sr-only">
                      Email address
                    </label>
                    <input
                      value={email}
                      onChange={(e) => {
                        setEmailErrorMessage(undefined)
                        setEmail(e.target.value)
                      }}
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                  {emailErrorMessage && <p className="pl-2 text-red-500">{emailErrorMessage}</p>}
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={onSubmit}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <LockClosedIcon className="h-5 w-5 text-secondary group-hover:text-primary" aria-hidden="true" />
                    </span>
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
