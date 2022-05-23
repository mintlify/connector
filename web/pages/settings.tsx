import Layout from "../components/layout"
import { BellIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/outline"
import { GetServerSideProps } from "next"
import { withSession } from "../lib/withSession"
import { UserSession } from "."
import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { API_ENDPOINT } from "../helpers/api"
import { classNames } from "../helpers/functions"
import { User } from "."
import { updateSession } from "../helpers/session"
import { useRouter } from "next/router"
import Head from "next/head"

export type EmailNotifications = {
  monthlyDigest: boolean
  newsletter: boolean
}

const navigation = [
  { name: "Account", href: "#setting-account", icon: UserCircleIcon },
  { name: "Organization", href: "#setting-organization", icon: UserGroupIcon },
  { name: "Notifications", href: "#setting-notifications", icon: BellIcon },
]

export default function Settings({ userSession }: { userSession: UserSession }) {
  const { user, org } = userSession
  
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [orgName, setOrgName] = useState(org?.name)
  const [invitedEmail, setInvitedEmail] = useState("")
  const [inviteErrorMessage, setInviteErrorMessage] = useState<string | undefined>(undefined)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [members, setMembers] = useState<User[]>([])
  const [emailNotifications, setNotifications] = useState<EmailNotifications>({
    monthlyDigest: false,
    newsletter: false,
  })

  useEffect(() => {
    if (user == null || org == null) return;
    // get all members of the organization
    axios.get(`${API_ENDPOINT}/routes/org/users?orgId=${org._id}`).then((res) => {
      setMembers(res.data.users)
    });

    setNotifications(org.notifications)

  }, [user, org])

  if (user == null || org == null) {
    router.push('/');
    return;
  };

  const inviteMember = async (email: string) => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim()) || email.trim() === "") {
      setInviteErrorMessage("Please enter a valid email address.")
      return
    }

    // disable the add member button before sending the invitation
    setIsSendingInvite(true)
    setInvitedEmail("")
    // create a pending account by calling the invitation API
    await axios
      .post(`${API_ENDPOINT}/routes/user/invite-to-org`, {
        emails: [email],
        orgId: org._id,
      })
      .then((res) => {
        setMembers(members.concat(res.data.users))
      })
    // send login invitation
    await axios.post("/api/login/magiclink", { email })
    setIsSendingInvite(false)
  }

  const onBlurFirstNameInput = async () => {
    await axios.put(`${API_ENDPOINT}/routes/user/${user.userId}/firstname`, {
      firstName,
    })
    updateSession()
  }

  const onBlurLastNameInput = async () => {
    await axios.put(`${API_ENDPOINT}/routes/user/${user.userId}/lastname`, {
      lastName,
    })
    updateSession()
  }

  const onBlurOrgNameInput = async () => {
    await axios.put(`${API_ENDPOINT}/routes/org/${org._id}/name?userId=${user.userId}`, {
      name: orgName,
    })
    updateSession()
  }

  const updateEmailNotifications = async (newNotifications: EmailNotifications) => {
    setNotifications(newNotifications)
    // update the organization's new notifications in the database
    await axios.put(`${API_ENDPOINT}/routes/org/${org._id}/notifications?userId=${user.userId}`, {
      ...newNotifications,
    })
  }

  return (
    <>
    <Head>
      <title>Settings</title>
    </Head>
    <Layout user={user} org={org}>
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        <div className="my-6 lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-0 px-2 sm:px-6 lg:px-0 lg:col-span-4">
            <nav className="space-y-1 lg:ml-40">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-gray-800 hover:bg-white group rounded-md px-3 py-2 flex items-center text-sm font-medium"
                >
                  <item.icon
                    className="text-primary group-hover:text-primary flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </a>
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                </div>
              </div>
            </form>

            <form action="#" method="POST" id="setting-organization">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white pt-6 pb-8 px-4 space-y-5 sm:px-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Organization</h3>
                    <p className="mt-1 text-sm text-gray-500">Settings for your organization and team members</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3">
                      <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1 rounded-md shadow-sm flex">
                        <input
                          type="text"
                          name="organization"
                          id="organization"
                          autoComplete="organization"
                          className="focus:ring-indigo-500 focus:border-indigo-500 flex-grow block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          onBlur={onBlurOrgNameInput}
                        />
                      </div>
                    </div>

                    <div className="col-span-3">
                      <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                        Domain
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="company-website"
                          id="company-website"
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-primary focus:border-primary sm:text-sm bg-gray-100 text-gray-400 border-gray-300"
                          value={org.subdomain}
                          disabled
                        />
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-white text-gray-500 sm:text-sm">
                          .mintlify.com
                        </span>
                      </div>
                      <p className="text-sm mt-2 text-gray-500">
                        <Link href="mailto:hi@mintlify.com">
                          <span className="text-primary font-medium cursor-pointer">Contact support</span>
                        </Link>{" "}
                        to change the domain address
                      </p>
                    </div>

                    <div className="col-span-3">
                      <div className="space-y-5">
                        <div className="sm:flex sm:items-center">
                          <div className="sm:flex-auto">
                            <h1 className="text-lg leading-6 font-medium text-gray-900">Members</h1>
                            <p className="mt-2 text-sm text-gray-500">Manage members of your organization here</p>
                          </div>
                        </div>
                        <div className="flex">
                          <div className="flex-grow">
                            <input
                              type="email"
                              name="add-team-members"
                              id="add-team-members"
                              className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
                              placeholder="Email address"
                              aria-describedby="add-team-members-helper"
                              value={invitedEmail}
                              onChange={(e) => {
                                setInviteErrorMessage(undefined)
                                setInvitedEmail(e.target.value)
                              }}
                              required
                            />
                            {inviteErrorMessage && <div className="text-red-500 pt-2 pl-2">{inviteErrorMessage}</div>}
                          </div>
                          <span className="ml-3">
                            <button
                              type="button"
                              disabled={isSendingInvite}
                              onClick={(e) => {
                                e.preventDefault()
                                inviteMember(invitedEmail)
                              }}
                              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hover focus:outline-none focus:ring-0 focus:ring-offset-2 sm:w-auto"
                            >
                              Add member
                            </button>
                          </span>
                        </div>
                        <div className="mt-8 flex flex-col">
                          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                      >
                                        Name
                                      </th>
                                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Role
                                      </th>
                                      {/* the column for the Edit button- this should be implement later. */}
                                      {/* <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Edit</span>
                                      </th> */}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 bg-white">
                                    {members.map((member) => (
                                      <tr key={member.email}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                          <div className="flex items-center">
                                            {member.pending ? (
                                              <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                                <svg
                                                  className="h-full w-full text-gray-300"
                                                  fill="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                              </span>
                                            ) : (
                                              <div className="h-10 w-10 flex-shrink-0 border border-gray-3 bg-hover text-white flex items-center justify-center rounded-full">
                                                <p className={"text-xs"}>{member.firstName[0] + member.lastName[0]}</p>
                                              </div>
                                            )}
                                            <div className="ml-4">
                                              <div
                                                className={classNames(
                                                  "font-medium text-gray-900",
                                                  member.pending ? "italic" : ""
                                                )}
                                              >
                                                {member.pending ? "Pending User" : `${member.firstName} ${member.lastName}`}
                                              </div>
                                              <div className="text-gray-500">{member.email}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                          {member.pending ? "Pending" : "Member"}
                                        </td>
                                        {/* Edit button- this should be implemented later */}
                                        {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                          <a href="#" className="text-primary hover:text-hover">
                                            Edit<span className="sr-only">, {`${member.firstName} ${member.lastName}`}</span>
                                          </a>
                                        </td> */}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <form action="#" method="POST" id="setting-notifications">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white pt-6 pb-8 px-4 space-y-5 sm:px-6">
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

const getServerSidePropsHandler: GetServerSideProps = async ({ req }: any) => {
  const userSession = req.session.get("user") ?? null
  const props = { userSession }
  return { props }
}

export const getServerSideProps = withSession(getServerSidePropsHandler)
