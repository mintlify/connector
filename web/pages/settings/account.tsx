import Layout from "../../components/layout"
import toast, { Toaster } from 'react-hot-toast';
import { UserCircleIcon, UserGroupIcon, ViewGridAddIcon } from "@heroicons/react/outline"
import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { API_ENDPOINT } from "../../helpers/api"
import { useRouter } from "next/router"
import Head from "next/head"
import { getSubdomain } from "../../helpers/user"
import { CheckCircleIcon, XIcon } from "@heroicons/react/solid";
import { useProfile } from "../../context/ProfileContex";

export type EmailNotifications = {
  monthlyDigest: boolean
  newsletter: boolean
}

export const navigation = [
  { name: "Account", href: "/settings/account", icon: UserCircleIcon },
  { name: "Organization", href: "/settings/organization", icon: UserGroupIcon },
  { name: "Integrations", href: "/settings/organization#integrations", icon: ViewGridAddIcon },
]

const notify = (title: string, description: string) => toast.custom((t) => {
  return (
    <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
  >
    <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
      <div className="max-w-sm w-full bg-white rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => {
                  toast.dismiss(t.id)
                }}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
});

export default function Settings() {
  const { profile, isLoadingProfile } = useProfile();
  const { user, org } = profile;
  
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [emailNotifications, setNotifications] = useState<EmailNotifications>({
    monthlyDigest: false,
    newsletter: false,
  });

  useEffect(() => {
    const { user, org } = profile;
    if (user == null || org == null) {
      if (!isLoadingProfile) {
        router.push('/');
      }
      return;
    };

    setFirstName(user.firstName);
    setLastName(user.lastName);
    setNotifications(org.notifications);
  }, [profile, router, isLoadingProfile]);

  if (isLoadingProfile || user == null || org == null) {
    return null;
  }

  const onBlurFirstNameInput = async () => {
    if (!firstName || firstName === user.firstName) {
      return;
    }
    await axios.put(`${API_ENDPOINT}/routes/user/${user.userId}/firstname`, {
      firstName,
    })
    notify('Profile name updated', 'Your first name has been updated.');
  }

  const onBlurLastNameInput = async () => {
    if (!lastName || lastName === user.lastName) {
      return;
    }
    await axios.put(`${API_ENDPOINT}/routes/user/${user.userId}/lastname`, {
      lastName,
    })
    notify('Profile name updated', 'Your last name has been updated.');
  }

  const updateEmailNotifications = async (newNotifications: EmailNotifications) => {
    setNotifications(newNotifications)
    // update the organization's new notifications in the database
    await axios.put(`${API_ENDPOINT}/routes/org/${org._id}/notifications`, {
      ...newNotifications,
    }, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    })
    notify('Updated notification settings', 'Your notification preferences have been updated.');
  }

  return (
    <>
    <Head>
      <link rel="shortcut icon" href={org.favicon} type="image/x-icon" />
      <title>Settings</title>
    </Head>
    <Layout user={user} org={org}>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8">
        <div className="my-6 lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-0 px-2 sm:px-6 lg:px-0 lg:col-span-4">
            <nav className="space-y-1 lg:ml-52">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    key={item.name}
                    className="text-gray-700 hover:text-gray-800 hover:bg-white group rounded-md px-3 py-2 flex items-center text-sm font-medium"
                  >
                    <item.icon
                      className="text-primary group-hover:text-primary flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </aside>

          <div className="space-y-8 sm:px-6 lg:px-0 lg:col-span-5">
            <form action="#" method="POST" id="setting-account">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white pt-6 pb-8 px-4 space-y-5 sm:px-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Account</h3>
                    <p className="mt-1 text-sm text-gray-500">Your personal account information</p>
                  </div>

                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onBlur={onBlurFirstNameInput}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        autoComplete="family-name"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onBlur={onBlurLastNameInput}
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="text"
                        name="email-address"
                        id="email-address"
                        autoComplete="email"
                        disabled
                        value={user.email}
                        className="mt-1 block w-full border border-gray-300 bg-gray-100 text-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm"
                      />
                      <p className="text-sm mt-2 text-gray-500">
                        <Link href="mailto:hi@mintlify.com">
                          <span className="text-primary font-medium cursor-pointer">Contact support</span>
                        </Link>{" "}
                        to change your primary email
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage notification preferences</p>
                  </div>

                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Email notifications</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="h-5 flex items-center">
                          <input
                            id="comments"
                            name="comments"
                            type="checkbox"
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                            checked={emailNotifications.monthlyDigest}
                            onChange={(_) =>
                              updateEmailNotifications({
                                ...emailNotifications,
                                monthlyDigest: !emailNotifications.monthlyDigest,
                              })
                            }
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="comments" className="font-medium text-gray-700">
                            Monthly documentation digest
                          </label>
                          <p className="text-gray-500">Get a detailed report on the monthly documentation changes</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-start">
                          <div className="h-5 flex items-center">
                            <input
                              id="candidates"
                              name="candidates"
                              type="checkbox"
                              className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                              checked={emailNotifications.newsletter}
                              onChange={(_) =>
                                updateEmailNotifications({
                                  ...emailNotifications,
                                  newsletter: !emailNotifications.newsletter,
                                })
                              }
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="candidates" className="font-medium text-gray-700">
                              Newsletter
                            </label>
                            <p className="text-gray-500">Be notified on product updates and special offers</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
    </>
  )
}
