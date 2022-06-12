import type { GetServerSideProps } from 'next'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import Layout from '../components/layout'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { API_ENDPOINT } from '../helpers/api'
import Head from 'next/head'
import 'react-loading-skeleton/dist/skeleton.css'
import LoadingItem from '../components/LoadingItem'
import { withSession } from '../lib/withSession'
import SignIn from '../components/screens/SignIn'
import Setup from '../components/screens/Setup'
import { DocumentTextIcon } from '@heroicons/react/outline'
import { Event } from '../components/Event'
import ActivityBar from '../components/ActivityBar'
import { getSubdomain } from '../helpers/user'
import Onboarding from '../components/screens/Onboarding'
import DocItem from '../components/DocItem'

type Code = {
  _id: string
  file: string
  url: string
}

export type Doc = {
  _id: string,
  title: string,
  lastUpdatedAt: string,
  createdAt: string,
  url: string,
  code: Code[],
  favicon?: string,
  method: string,
  slack?: boolean,
  email?: boolean
}

export type UserSession = {
  userId: string
  user?: User
  org?: Org
  tempAuthData?: {
    email: string
    firstName?: string
    lastName?: string
    orgId?: string
    orgName?: string
  }
}

export type AccessMode = 'private' | 'public'

export type Org = {
  _id: string
  name: string
  logo: string
  favicon: string
  subdomain: string
  notifications: {
    monthlyDigest: boolean
    newsletter: boolean
  }
  access?: {
    mode: AccessMode
  },
  onboarding?: {
    teamSize: string;
    usingGitHub: boolean;
    usingSlack: boolean;
    usingNone: boolean;
  }
}

export type User = {
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  profilePicture?: string,
  pending?: boolean;
  onboarding?: {
    isCompleted: boolean;
    role: string;
    usingVSCode: boolean;
  }
}

export default function Home({ userSession }: { userSession: UserSession }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Doc>();
  const [isAddDocLoading, setIsAddDocLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [integrationsStatus, setIntegrationsStatus] = useState<{ [key: string]: boolean }>();

  useEffect(() => {
    if (userSession == null || userSession.user == null || userSession.org == null) {
      return
    }

    const userId = userSession.userId

    axios
      .get(`${API_ENDPOINT}/routes/docs`, {
        params: {
          userId: userId,
          subdomain: getSubdomain(window.location.host),
        },
      })
      .then((docsResponse) => {
        const { docs } = docsResponse.data
        setDocs(docs)
      })
      .finally(() => {
        setIsLoading(false)
      })

    axios
      .get(`${API_ENDPOINT}/routes/events`, {
        params: {
          userId,
          subdomain: getSubdomain(window.location.host),
          doc: selectedDoc ? selectedDoc._id : undefined,
        },
      })
      .then((eventsResponse) => {
        const { events } = eventsResponse.data
        setEvents(events)
      })
  }, [userSession, selectedDoc, isAddDocLoading])

  const { user, org } = userSession;

  useEffect(() => {
    if (user == null || org == null) {
      return;
    }

    axios.get(`${API_ENDPOINT}/routes/org/${org._id}/integrations`, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    })
    .then(({ data }) => {
      const { integrations } = data;
      setIntegrationsStatus(integrations);
    })
  }, [user, org]);

  if (!userSession) {
    return <SignIn />
  }

  if (user == null) {
    return (
      <>
        <Head>
          <title>Finish setting up your account</title>
        </Head>
        <Setup userSession={userSession} />
      </>
    )
  }

  if (org == null) {
    return (
      <div>
        You do not have permission to this organization
        <Link href="/api/logout">Logout</Link>
      </div>
    )
  }

  if (!user.onboarding?.isCompleted) {
    return <Onboarding user={user} org={org} />
  }

  const onClickDoc = (doc: Doc) => {
    if (doc._id === selectedDoc?._id) {
      setSelectedDoc(undefined)
      return
    }
    setSelectedDoc(doc)
  }

  const ClearSelectedFrame = () => {
    if (!selectedDoc) return null
    return <div className="absolute inset-0" onClick={() => setSelectedDoc(undefined)}></div>
  }

  const hasDocs = (docs && docs.length > 0) || isAddDocLoading

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={org.favicon} type="image/x-icon" />
        <title>{org.name} Dashboard</title>
      </Head>
      <Layout user={user} org={org}>
        <ClearSelectedFrame />
        <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 min-w-0 xl:flex">
            <Sidebar
              org={org}
              user={user}
              setIsAddDocLoading={setIsAddDocLoading}
              isAddDocumentOpen={isAddDocumentOpen}
              setIsAddDocumentOpen={setIsAddDocumentOpen}
            />
            {/* Projects List */}
            <div className="bg-white lg:min-w-0 lg:flex-1">
              <ClearSelectedFrame />
              <div className="pl-4 pr-6 pt-4 pb-4 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
                <div className="flex items-center">
                  {hasDocs && <h1 className="flex-1 text-lg font-medium text-gray-800">Documentation</h1>}
                </div>
              </div>
              {!hasDocs && !isLoading && (
                <div className="pb-8">
                  <div className="flex items-center justify-center">
                    <img className="w-24 h-24" src="/assets/empty/docs.svg" alt="No documentations" />
                  </div>
                  <p className="text-center mt-6 text-gray-600 font-medium">No documentation found</p>
                  <p className="mt-1 text-center text-sm text-gray-400">Add one to get started</p>
                  <div className="mt-4 flex justify-center">
                    <button
                      className="inline-flex items-center justify-center text-sm bg-primary text-white rounded-md shadow-sm py-2 font-medium px-8 hover:bg-hover"
                      onClick={() => setIsAddDocumentOpen(true)}
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      Add Documentation
                    </button>
                  </div>
                </div>
              )}
              <ul role="list" className="relative z-0">
                {isAddDocLoading && <LoadingItem />}
                {docs?.map((doc) => (
                  <DocItem
                    key={doc._id}
                    user={user}
                    doc={doc}
                    onClick={onClickDoc}
                    selectedDoc={selectedDoc}
                    setSelectedDoc={setSelectedDoc}
                    docs={docs}
                    setDocs={setDocs}
                    integrationsStatus={integrationsStatus}
                  />
                ))}
              </ul>
            </div>
          </div>
          {/* Activity feed */}
          <div className="relative bg-gray-50 pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0 z-10">
            <ActivityBar
              events={events}
              selectedDoc={selectedDoc}
              user={user}
            />
          </div>
        </div>
      </Layout>
    </>
  )
}

const getServerSidePropsHandler: GetServerSideProps = async ({ req }: any) => {
  const userSession = req.session.get('user') ?? null
  const props = { userSession }
  return { props }
}

export const getServerSideProps = withSession(getServerSidePropsHandler)
