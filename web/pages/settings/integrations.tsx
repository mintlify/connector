import Layout from '../../components/layout'
import { useState, useEffect } from 'react'
import { API_ENDPOINT } from '../../helpers/api'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { navigation } from './account'
import { Integration, onInstallIntegration } from '../../helpers/integrations';
import { useProfile } from '../../context/ProfileContext'
import { request } from '../../helpers/request'

type IntegrationSection = {
  title: string,
  subtitle: string,
  integrations: Integration[]
}

const getIntegrationSections = (orgId: string, userId: string): IntegrationSection[] => {
  return [
    {
      title: 'Alerts',
      subtitle: 'Receive alerts about your documentation',
      integrations: [
        {
          type: 'slack',
          title: 'Slack',
          iconSrc: '/assets/integrations/slack.svg',
          installUrl: `${API_ENDPOINT}/routes/integrations/slack/install?org=${orgId}&close=true`
        },
      ],
    },
    {
      title: 'Documentation',
      subtitle: 'Integration with documentation platforms',
      integrations: [
        {
          type: 'google',
          title: 'Google Docs',
          iconSrc: '/assets/integrations/google-docs.svg',
          installUrl: `${API_ENDPOINT}/routes/integrations/google/install?org=${orgId}&close=true`
        },
        {
          type: 'notion',
          title: 'Notion',
          iconSrc: '/assets/integrations/notion.svg',
          installUrl: `${API_ENDPOINT}/routes/integrations/notion/install?org=${orgId}&close=true&userId=${userId}`
        },
      ],
    },
    {
      title: 'Code',
      subtitle: 'Connect documentation with your code',
      integrations: [
        {
          type: 'github',
          title: 'GitHub',
          iconSrc: '/assets/integrations/github.svg',
          installUrl: `${API_ENDPOINT}/routes/integrations/github/install?org=${orgId}&close=true&userId=${userId}`
        },
        {
          type: 'vscode',
          title: 'VS Code',
          iconSrc: '/assets/integrations/vscode.svg',
          installUrl: 'vscode:extension/mintlify.connector',
          useRouter: true
        },
      ],
    },
  ];
};

export default function Settings() {
  const { profile, isLoadingProfile } = useProfile();
  const router = useRouter()
  const [integrationsStatus, setIntegrationsStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const { user, org } = profile;
    if (user == null || org == null) {
      if (!isLoadingProfile) {
        router.push('/')
      }
      return
    }
    
    const statusInterval = setInterval(() => {  
      request('GET', `routes/org/${org._id}/integrations`)
        .then(({ data: { integrations } }) => {
          setIntegrationsStatus(integrations);
          })
        }, 1000);
      
      return () => clearInterval(statusInterval);
  }, [profile, isLoadingProfile, router]);

  const { user, org } = profile;
  if (isLoadingProfile || user == null || org == null) {
    return null;
  }

  const integrationSections = getIntegrationSections(org._id, user.userId);

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={org.favicon} type="image/x-icon" />
        <title>Integrations</title>
      </Head>
      <Layout>
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
              <form method="POST" id="integrations">
                <div className="shadow sm:rounded-md">
                  <div className="bg-white pt-6 pb-8 px-4 space-y-4 sm:px-6">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Integrations</h3>
                      <p className="mt-1 text-sm text-gray-500">Connections for your documentation stack</p>
                    </div>

                    <ul role="list" className="divide-y divide-gray-200">
                      {integrationSections.map((section) => (
                        <li key={section.title} className="px-4 py-4 sm:px-0">
                          <h1 className="text-gray-800 font-medium">{section.title}</h1>
                          <p className="text-gray-500 text-sm">{section.subtitle}</p>
                          {section.integrations.map((integration) => (
                            <div key={integration.type} className="mt-2 flex">
                              <div className="flex-1 flex items-center text-gray-700">
                                <img className="h-4 w-4 mr-2" src={integration.iconSrc} alt={integration.title} />
                                {integration.title}
                              </div>
                              <div className="text-sm">
                                { integrationsStatus[integration.type]
                                ? (integration.type === 'vscode' ?
                                    <CheckCircleIcon className="h-4 w-4 text-green-600" /> :
                                    <span
                                      className="text-gray-700 font-medium cursor-pointer"
                                      onClick={() => onInstallIntegration(integration, router)}
                                    >
                                      Edit
                                    </span>
                                  )
                                : <span
                                    className="text-primary font-medium cursor-pointer"
                                    onClick={() => onInstallIntegration(integration, router)}
                                  >
                                    Install
                                  </span>
                                }
                              </div>
                            </div>
                          ))}
                        </li>
                      ))}
                    </ul>
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
