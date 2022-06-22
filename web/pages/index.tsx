import Sidebar from '../components/Sidebar'
import Layout from '../components/layout'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import 'react-loading-skeleton/dist/skeleton.css'
import LoadingItem from '../components/LoadingItem'
import SignIn from '../components/screens/SignIn'
import Setup from '../components/screens/Setup'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import ActivityBar, { Task } from '../components/ActivityBar'
import Onboarding from '../components/screens/Onboarding'
import DocItem from '../components/DocItem'
import { useProfile } from '../context/ProfileContext'
import { request } from '../helpers/request'
import GroupItem, { Group } from '../components/GroupItem'
import { DocTitleIcon } from '../helpers/Icons'

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
  email?: boolean,
  tasks?: Task[],
}

export type IntegrationsStatus = { [key: string]: boolean };

export default function Home() {
  const { profile, isLoadingProfile, session } = useProfile()
  const [docs, setDocs] = useState<Doc[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group>();
  const [selectedDoc, setSelectedDoc] = useState<Doc>();
  const [isAddDocLoading, setIsAddDocLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [integrationsStatus, setIntegrationsStatus] = useState<IntegrationsStatus>();

  const { user, org } = profile;

  useEffect(() => {
    if (user == null || org == null) {
      return
    }

    request('GET', 'routes/docs/groups')
      .then((groupsResponse) => {
        const { groups } = groupsResponse.data;
        setGroups(groups);
      })

    request('GET', 'routes/docs')
      .then((docsResponse) => {
        const { docs } = docsResponse.data
        setDocs(docs)
      })
      .finally(() => {
        setIsLoading(false)
      })
    request('GET', `routes/org/${org._id}/integrations`)
      .then(({ data }) => {
        const { integrations } = data;
        setIntegrationsStatus(integrations);
      })

  }, [org, user, selectedDoc, isAddDocLoading]);

  if (isLoadingProfile) {
    return null;
  }

  if (!session) {
    return <SignIn />
  }

  if (user == null) {
    return (
      <>
        <Head>
          <title>Finish setting up your account</title>
        </Head>
        <Setup />
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

  if (!user?.onboarding?.isCompleted) {
    return <Onboarding />
  }

  const onClickDoc = (doc: Doc) => {
    if (doc._id === selectedDoc?._id) {
      setSelectedDoc(undefined)
      return
    }
    setSelectedDoc(doc)
  }

  const updateDoc = (docId: string, newDoc: Doc) => {
    setDocs(docs.map((doc) => {
      if (doc._id === docId) {
        return newDoc;
      }

      return doc;
    }))
  }

  const ClearSelectedFrame = () => {
    if (!selectedDoc) return null
    return <div className="absolute inset-0" onClick={() => setSelectedDoc(undefined)}></div>
  }

  const hasDocs = (docs && docs.length > 0) || isAddDocLoading;
  const activeDocs = docs.filter((doc) => doc.method === selectedGroup?._id)

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={org.favicon} type="image/x-icon" />
        <title>{org.name} Dashboard</title>
      </Head>
      <Layout>
        <ClearSelectedFrame />
        <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 min-w-0 xl:flex">
            <Sidebar
              setIsAddDocLoading={setIsAddDocLoading}
              isAddDocumentOpen={isAddDocumentOpen}
              setIsAddDocumentOpen={setIsAddDocumentOpen}
              integrationsStatus={integrationsStatus || {}}
            />
            {/* Projects List */}
            <div className="bg-white lg:min-w-0 lg:flex-1">
              <ClearSelectedFrame />
              <div className="pl-4 pr-6 pt-4 pb-4 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
                <div className="flex items-center">
                  { selectedGroup && <button onClick={() => { setSelectedGroup(undefined); setSelectedDoc(undefined)}} className="p-1 rounded-lg hover:bg-gray-100 text-gray-700 mr-2 z-20"><ChevronLeftIcon className="h-5 w-5" /></button> }
                  { selectedGroup && <span className="mr-2"><DocTitleIcon method={selectedGroup._id} /></span> }
                  {hasDocs && <h1 className="flex-1 text-lg font-medium text-gray-700">{ selectedGroup ? selectedGroup.name : 'Documentation' }</h1>}
                  { selectedGroup && <span className="text-sm rounded-full bg-slate-400 text-white py-px px-2">{selectedGroup.count} documents</span> }
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 512 512" fill="currentColor">
                        <path d="M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z"/>
                      </svg>
                      Import Documentation
                    </button>
                  </div>
                </div>
              )}
              {
                selectedGroup && <ul role="list" className="relative z-0">
                {isAddDocLoading && <LoadingItem />}
                {activeDocs?.map((doc) => (
                  <DocItem
                    key={doc._id}
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
              }
              {
                !selectedGroup && <ul role="list" className="relative z-0">
                {groups.map((group) => <GroupItem group={group} key={group._id} setSelectedGroup={setSelectedGroup} />
                )}
              </ul>
              }
            </div>
          </div>
          {/* Activity feed */}
          <div className="relative bg-gray-50 pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0 z-10">
            <ActivityBar
              selectedDoc={selectedDoc}
              updateDoc={updateDoc}
            />
          </div>
        </div>
      </Layout>
    </>
  )
}