import Layout from '../../components/layout'
import toast, { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { classNames } from '../../helpers/functions'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getSubdomain } from '../../helpers/user'
import ProfilePicture from '../../components/ProfilePicture'
import { CheckCircleIcon, XIcon } from '@heroicons/react/solid'
import { navigation } from './account'
import { AccessMode, useProfile, User } from '../../context/ProfileContext'
import { request } from '../../helpers/request'

type AccessOption = {
  id: AccessMode
  name: string
  description: string
}

const access: AccessOption[] = [
  { id: 'public', name: 'Public', description: 'Anyone can join' },
  { id: 'private', name: 'Private', description: 'Only invited members can join' },
]

const notify = (title: string, description: string) =>
  toast.custom((t) => {
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
  })

export default function Settings() {
  const { profile, isLoadingProfile } = useProfile();
  const router = useRouter()
  const [orgName, setOrgName] = useState<string>('')
  const [orgAccessMode, setOrgAccessMode] = useState(profile?.org?.access?.mode || 'public')
  const [invitedEmail, setInvitedEmail] = useState('')
  const [inviteErrorMessage, setInviteErrorMessage] = useState<string | undefined>(undefined)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [members, setMembers] = useState<User[]>([])

  useEffect(() => {
    const { user, org } = profile;
    if (user == null || org == null) {
      if (!isLoadingProfile) {
        router.push('/')
      }
      return
    }

    setOrgName(org.name);

    // get all members of the organization
    request('GET', 'routes/org/users')
      .then((res) => {
        setMembers(res.data.users)
      })
  }, [profile, isLoadingProfile, router]);

  const { user, org } = profile;
  if (isLoadingProfile || user == null || org == null) {
    return null;
  }

  const inviteMember = async (email: string) => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim()) || email.trim() === '') {
      setInviteErrorMessage('Please enter a valid email address.')
      return
    }

    // disable the add member button before sending the invitation
    setIsSendingInvite(true)
    setInvitedEmail('')
    // create a pending account by calling the invitation API
    const emails = [email]
    await request('POST', 'routes/user/invite', {
      data: {
        emails,
      },
    }).then(() => {
        const invitedMembers: any = emails.map((email) => {
          return {
            email,
            pending: true,
          }
        })
        setMembers(members.concat(invitedMembers))
      })
    notify('Invited user', 'Sent invitation email to ' + email)
    setIsSendingInvite(false)
  }

  const onBlurOrgNameInput = async () => {
    if (!orgName || orgName === org.name) {
      return
    }
    await request('PUT', `routes/org/${org._id}/name`,
      {
        data: {
          name: orgName,
        },
        params: {
          userId: user.userId,
          subdomain: getSubdomain(window.location.host),
        },
      }
    )
    notify('Organization name updated', 'Your organization name has been updated.')
  }

  const updateAccessSetting = async (newAccessMode: AccessMode) => {
    setOrgAccessMode(newAccessMode)
    request('PUT', 'routes/org/access',
      {
        data: {
          mode: newAccessMode,
        },
        params: {
          userId: user.userId,
          subdomain: getSubdomain(window.location.host),
        },
      }
    )
    if (newAccessMode === 'private') {
      notify('Updated access settings', 'Only invited members can join the organization')
    } else {
      notify('Updated access settings', 'Anyone can join the organization')
    }
  }

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={org.favicon} type="image/x-icon" />
        <title>Settings</title>
      </Head>
      <Layout>
        <Toaster position="bottom-right" reverseOrder={false} />
        <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8">
          <div className="my-6 lg:grid lg:grid-cols-12 lg:gap-x-5">
            <aside className="py-0 px-2 sm:px-6 lg:px-0 lg:col-span-4">
              <nav className="space-y-1 lg:ml-52">
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
                            className="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
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
                          </Link>{' '}
                          to change the domain address
                        </p>
                      </div>

                      <div className="col-span-3">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">Access</h2>
                        <p className="mt-1 text-sm text-gray-500">Settings for who can join the organization</p>
                        <fieldset className="mt-2">
                          <div className="divide-y divide-gray-200">
                            {access.map((accessOption) => (
                              <div key={accessOption.id} className="relative flex items-start py-4">
                                <div className="min-w-0 flex-1 text-sm">
                                  <label htmlFor={`account-${accessOption.id}`} className="font-medium text-gray-700">
                                    {accessOption.name}
                                  </label>
                                  <p id={`account-${accessOption.id}-description`} className="text-gray-500">
                                    {accessOption.description}
                                  </p>
                                </div>
                                <div className="ml-3 flex items-center h-5">
                                  <input
                                    id={`account-${accessOption.id}`}
                                    aria-describedby={`account-${accessOption.id}-description`}
                                    name="account"
                                    type="radio"
                                    defaultChecked={accessOption.id === orgAccessMode}
                                    className="focus:ring-0 cursor-pointer h-4 w-4 text-primary border-gray-300"
                                    onClick={() => updateAccessSetting(accessOption.id)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </fieldset>
                      </div>

                      <div className="col-span-3" id="invite">
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
                                className="block w-full shadow-sm focus:ring-primary focus:border-primary sm:text-sm border-gray-300 rounded-md"
                                placeholder="Email address"
                                aria-describedby="add-team-members-helper"
                                value={invitedEmail}
                                onChange={(e) => {
                                  setInviteErrorMessage(undefined)
                                  setInvitedEmail(e.target.value)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') { 
                                    inviteMember(invitedEmail);
                                  }
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
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hover focus:outline-none focus:ring-0 focus:ring-offset-2 sm:w-auto hover:cursor-pointer"
                              >
                                Invite member
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
                                                <span className="inline-block h-10 w-10 rounded-full bg-gray-100 overflow-hidden">
                                                  <svg
                                                    className="h-full w-full text-gray-300"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                  </svg>
                                                </span>
                                              ) : (
                                                <ProfilePicture size={10} />
                                              )}
                                              <div className="ml-4">
                                                <div
                                                  className={classNames(
                                                    'font-medium text-gray-900',
                                                    member.pending ? 'italic' : ''
                                                  )}
                                                >
                                                  {member.pending ? 'Pending User' : `${member.firstName} ${member.lastName}`}
                                                </div>
                                                <div className="text-gray-500">{member.email}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {member.pending ? 'Pending' : 'Member'}
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
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
