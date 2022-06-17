import { Combobox } from "@headlessui/react";
import { CheckCircleIcon,  ChevronRightIcon } from "@heroicons/react/solid";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../helpers/api";
import { classNames } from "../../helpers/functions";
import { DocumentationTypeIcon } from "../../helpers/Icons";
import { getSubdomain } from "../../helpers/user";
import { Doc } from "../../pages";
import AddDocumentation, { addDocumentationMap, AddDocumentationType } from "../commands/documentation/AddDocumentation";
import DocItem from "../DocItem";
import LoadingItem from "../LoadingItem";
import ProfilePicture from "../ProfilePicture";
import { getIntegrations, onInstallIntegration, Integration } from "../../helpers/integrations";
import { Org, useProfile, User } from "../../context/ProfileContext";
import { request } from "../../helpers/request";

const onboardStepLocalStateKey = 'onboarding-step';

type Option = {
  id: string,
  title: string,
}

const rolesOptions: Option[] = [
  { id: 'founder', title: 'Founder' },
  { id: 'executive', title: 'Executive' },
  { id: 'em', title: 'Engineering Manager' },
  { id: 'pm', title: 'Product Manager' },
  { id: 'engineer', title: 'Engineer' },
  { id: 'tw', title: 'Technical Writer' },
  { id: 'other', title: 'Other' },
]

const sizeOptions: Option[] = [
  { id: '1', title: 'Individual' },
  { id: '2-10', title: '2 - 10' },
  { id: '11-50', title: '11 - 50' },
  { id: '51-200', title: '51 - 200' },
  { id: '200+', title: '200+' },
]

const appsOptions: Option[] = [
  { id: 'github', title: 'GitHub' },
  { id: 'vscode', title: 'VS Code' },
  { id: 'slack', title: 'Slack' },
  { id: 'none', title: 'None of the above' },
]

type NavButtonsProps = {
  onBack: () => void,
  onNext: () => void,
  isCompleted: boolean,
  isFirst?: boolean,
  isLast?: boolean,
  onSkip?: () => void,
  isSubmitting?: boolean,
}

const ProgressBar = ({ step, totalSteps }: { step: number, totalSteps: number }) => {
  return <div className="mt-4 flex space-x-2">
  {Array.from(Array(totalSteps).keys()).map((i) => (
      <span key={i} className={classNames(`h-1 w-14 rounded-sm`, i > step ? 'bg-slate-200' : 'bg-primary')}></span>
    ))
  }
</div>
}

const NavButtons = ({ onBack, onNext, isFirst, isLast, isCompleted, onSkip, isSubmitting }: NavButtonsProps) => {
  return <div className="flex mt-8 space-x-2">
    {
      !isFirst && <button
      className="bg-white border border-gray-500 hover:bg-gray-100 py-1 px-6 rounded-sm text-gray-600"
      onClick={onBack}
    >Back</button>
    }
    <button
      className={classNames("py-1 px-6 rounded-sm text-white", isCompleted ? 'bg-primary hover:bg-hover' : 'bg-gray-400')}
      onClick={onNext}
      disabled={!isCompleted}
    >{isSubmitting? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white animate-spin" viewBox="0 0 512 512" fill="currentColor">
    <path d="M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z"/>
  </svg> : isLast ? 'Complete' : 'Next'}</button>
    {
      onSkip && <button
      className="py-1 px-3 rounded-sm text-sm text-gray-400 hover:text-gray-500"
      onClick={onSkip}
    >Skip</button>
    }
  </div>
}

const buildAppsUsing = (user: User, org: Org) => {
  const apps = [];
  if (user.onboarding?.usingVSCode) {
    apps.push('vscode');
  }
  if (org.onboarding?.usingGitHub) {
    apps.push('github');
  }
  if (org.onboarding?.usingSlack) {
    apps.push('slack');
  }
  if (org.onboarding?.usingNone) {
    apps.push('none');
  }
  return apps;
}

export default function Onboarding() {
  const { profile } = useProfile();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string>();
  const [teamSize, setTeamSize] = useState<string>();
  const [appsUsing, setAppsUsing] = useState<string[]>([]);

  const { user, org } = profile;

  useEffect(() => {
    if (user == null || org == null) {
      return;
    }
    const step = window.localStorage.getItem(onboardStepLocalStateKey);

    setRole(user.onboarding?.role);
    setTeamSize(org.onboarding?.teamSize);
    setAppsUsing(buildAppsUsing(user, org));

    if (step) {
      setStep(parseInt(step));
    }
  }, [user, org]);

  if (user == null || org == null) {
    return null;
  }

  const onBack = () => {
    if (step === 0) {
      return;
    }

    window.localStorage.setItem(onboardStepLocalStateKey, (step - 1).toString());
    setStep(step - 1);
  }

  const onNext = () => {
    if (step === 3) {
      return;
    }

    window.localStorage.setItem(onboardStepLocalStateKey, (step + 1).toString());
    setStep(step + 1);
  }

  const hasApps = appsUsing.filter((app) => app !== 'none').length > 0;
  const totalSteps = hasApps ? 4 : 3;

  const CurrentStep = () => {
    switch (step) {
      case 0:
        return <IntroStep
          user={user}
          onBack={onBack}
          onNext={onNext}
          role={role}
          setRole={setRole}
          teamSize={teamSize}
          setTeamSize={setTeamSize}
          appsUsing={appsUsing}
          setAppsUsing={setAppsUsing}
          step={step}
          totalSteps={totalSteps}
        />;
      case 1:
        return <AddDocStep
          user={user}
          org={org}
          onBack={onBack}
          onNext={onNext}
          step={step}
          totalSteps={totalSteps}
        />;
      case 2:
        if (!hasApps) {
          return <InviteStep
            user={user}
            onBack={onBack}
            step={step}
            totalSteps={totalSteps}
            />;
        }
        return <IntegrateStep
          user={user}
          org={org}
          onBack={onBack}
          onNext={onNext}
          appsUsing={appsUsing}
          step={step}
          totalSteps={totalSteps}
        />;
      case 3:
        return <InviteStep
          user={user}
          onBack={onBack}
          step={step}
          totalSteps={totalSteps} />;
      default:
        return null;
    }
  }

  return (
    <>
    <Head>
      <title>Getting started</title>
    </Head>
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="w-96 max-w-full mx-auto py-12">
          <CurrentStep />
        </div>
      </div>
    </div>
    </>
  )
}

function IntroStep({ user, onBack, onNext, role, setRole, teamSize, setTeamSize, appsUsing, setAppsUsing, step, totalSteps }:
  { user: User, onBack: () => void, onNext: () => void, role: string | undefined, setRole: (role: string) => void, teamSize: string | undefined, setTeamSize: (teamSize: string) => void, appsUsing: string[], setAppsUsing: (appsUsing: string[]) => void, step: number, totalSteps: number }) {
  const onClickAppOptions = (appOptionId: string) => {
    if (appsUsing.includes(appOptionId)) {
      setAppsUsing(appsUsing.filter((app) => app !== appOptionId));
      return;
    }

    setAppsUsing([...appsUsing, appOptionId]);
  }

  const onNextFirstPage = async () => {
    axios.post(`${API_ENDPOINT}/routes/user/onboarding`, {
      role,
      teamSize,
      appsUsing
    }, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    })
    onNext();
  }

  const isCompleted = role != null && teamSize != null && appsUsing.length > 0;
  return <>
    <h1 className="text-3xl font-semibold">Welcome <span className="text-primary">{user.firstName}</span> 👋</h1>
    <p className="mt-1 text-gray-600">
      First things first, tell us about yourself
    </p>
    <ProgressBar step={step} totalSteps={totalSteps} /> 
    <div className="mt-6 space-y-8">
      <div>
        <label className="text-base font-medium text-gray-900">What best describes what you do?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {rolesOptions.map((roleOption) => (
              <div key={roleOption.id} className="flex items-center">
                <input
                  id={roleOption.id}
                  name="role"
                  type="radio"
                  defaultChecked={role === roleOption.id}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                  onClick={() => setRole(roleOption.id)}
                />
                <label htmlFor={roleOption.id} className="ml-3 block text-sm text-gray-700">
                  {roleOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">How big is your team?</label>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {sizeOptions.map((sizeOption) => (
              <div key={sizeOption.id} className="flex items-center">
                <input
                  id={sizeOption.id}
                  name="size"
                  type="radio"
                  defaultChecked={teamSize === sizeOption.id}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                  onClick={() => setTeamSize(sizeOption.id)}
                />
                <label htmlFor={sizeOption.id} className="ml-3 block text-sm text-gray-700">
                  {sizeOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">Which of the following do you or your team use?</label>
        <p className="text-sm leading-5 text-gray-500">Check all that apply</p>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {appsOptions.map((appOption) => (
              <div key={appOption.id} className="flex items-center">
                <input
                  id={appOption.id}
                  name="role-option"
                  type="checkbox"
                  defaultChecked={appsUsing.includes(appOption.id)}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                  onClick={() => onClickAppOptions(appOption.id)}
                />
                <label htmlFor={appOption.id} className="ml-3 block text-sm text-gray-700">
                  {appOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      </div>
    <NavButtons onBack={onBack} onNext={onNextFirstPage} isFirst isCompleted={isCompleted} />
  </>;
}

function AddDocStep({ user, org, onBack, onNext, step, totalSteps }: { user: User, org: Org, onBack: () => void, onNext: () => void, step: number, totalSteps: number }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isAddingDocOpen, setIsAddingDocOpen] = useState(false);
  const [addDocumentationType, setAddDocumentationType] = useState<AddDocumentationType>();
  const [isAddDocLoading, setIsAddDocLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/routes/docs`, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host),
        shouldShowCreatedBySelf: true,
      }
    })
      .then((docsResponse) => {
        const { docs } = docsResponse.data;
        setDocs(docs);
      });
  }, [user.userId, isAddDocLoading]);

  const isCompleted = docs.length > 0;

  return <>
    <AddDocumentation
      isOpen={isAddingDocOpen}
      setIsOpen={setIsAddingDocOpen}
      setIsAddDocLoading={setIsAddDocLoading}
      overrideSelectedRuleType={addDocumentationType}
    />
    <h1 className="text-3xl font-semibold">
      Let&apos;s add some <span className="text-primary">documentation</span> 🗃
    </h1>
    <p className="mt-1 text-gray-600">
      You can import or link your existing pages
    </p>
    <ProgressBar step={step} totalSteps={totalSteps} /> 
    <div className="mt-6 space-y-8">
      <div className="bg-white rounded-md shadow-md">
        <Combobox onChange={() => {}} value="">
          <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
            {Object.values(addDocumentationMap).map((item) => (
              <Combobox.Option
                key={item.type}
                value={item}
                className={({ active }) =>
                  classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                }
                onClick={() => { setIsAddingDocOpen(true); setAddDocumentationType(item.type) }}
              >
                {({ active }) => (
                  <>
                    <DocumentationTypeIcon
                      type={item.type}
                    />
                    <div className="ml-4 flex-auto">
                      <p
                        className={classNames(
                          'text-sm font-medium',
                          active ? 'text-gray-900' : 'text-gray-700'
                        )}
                      >
                        {item.title}
                      </p>
                      <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                        {item.description}
                      </p>
                    </div>
                    <ChevronRightIcon
                      className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                      aria-hidden="true"
                    />
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
      </Combobox>
      </div>
      {
        docs.length > 0 && <div>
        <h1 className="text-lg text-gray-600">Documents added</h1>
        <ul className="mt-2 bg-white rounded-md p-3 shadow-md">
          { isAddDocLoading && <LoadingItem /> }
          {docs.map((doc) => (
            <DocItem
              key={doc._id}
              doc={doc}
              docs={docs}
              setDocs={setDocs}
              onClick={() => {}}
              setSelectedDoc={() => {}}
              removeSeparators
            />
          ))}
          </ul>
        </div>
      }
      </div>
    <NavButtons onBack={onBack} onNext={onNext} isCompleted={isCompleted} />
  </>;
}

function IntegrateStep({ user, org, onBack, onNext, appsUsing, step, totalSteps }: { user: User, org: Org, onBack: () => void, onNext: () => void, appsUsing: string[], step: number, totalSteps: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [installedIntegrations, setInstalledIntegrations] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const integrations: Integration[] = getIntegrations(org._id);

  useEffect(() => {
    setIsLoading(true);
    const statusInterval = setInterval(() => {  
      axios.get(`${API_ENDPOINT}/routes/org/${org._id}/integrations`, {
        params: {
          userId: user.userId,
          subdomain: getSubdomain(window.location.host)
        }
      }).then(({ data: { integrations } }) => {
          setIsLoading(false);
          setInstalledIntegrations(integrations);
        })
      }, 1000);
    
    return () => clearInterval(statusInterval);
  }, [user, org._id])

  const requiredIntegrations = integrations.filter(({ type }) => appsUsing.includes(type));
  const isAllIntegrationsInstalled = requiredIntegrations.every(({ type }) => installedIntegrations[type]);

  return <>
    <h1 className="text-3xl font-semibold">
      Let&apos;s get you{' '}<span className="text-primary">integrated</span> 🔌
    </h1>
    <p className="mt-1 text-gray-600">
      Connect with the apps that you use
    </p>
    <ProgressBar step={step} totalSteps={totalSteps} /> 
    <div className="mt-6 space-y-8">
      <div>
        <div className="mt-2 bg-white rounded-md p-3 shadow-md">
          { isLoading && <span className="w-full flex justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 animate-spin" viewBox="0 0 512 512" fill="currentColor">
              <path d="M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z"/>
            </svg></span>
          }
          {
            !isLoading && <Combobox onChange={() => {}} value="">
          <Combobox.Options static className="scroll-py-3 overflow-y-auto">
            {requiredIntegrations.map((integration) => (
                <Combobox.Option
                  value={integration}
                  key={integration.type}
                  className={({ active }) =>
                    classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                  }
                  onClick={() => onInstallIntegration(integration, router)}
                >
                  {({ active }) => (
                    <>
                      <img className="h-5 w-5" src={integration.iconSrc} alt={integration.title} />
                      <div className="ml-4 flex-auto">
                        <div className="flex items-center gap-x-1">
                          <p
                            className={classNames(
                              'text-sm font-medium',
                              active ? 'text-gray-900' : 'text-gray-700'
                            )}
                          >
                            {integration.title}
                          </p>
                          {
                            installedIntegrations[integration.type] && <CheckCircleIcon className="w-4 h-4 text-green-600" />
                          }
                        </div>
                        <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                          {integration.description}
                        </p>
                      </div>
                      {
                        !installedIntegrations[integration.type] && <ChevronRightIcon
                        className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                        aria-hidden="true"
                      />
                      }
                    </>
                  )}
                </Combobox.Option>
            ))}
          </Combobox.Options>
      </Combobox>
        }
        </div>
      </div>
      </div>
    <NavButtons onBack={onBack} onNext={onNext} isCompleted={isAllIntegrationsInstalled} onSkip={onNext} />
  </>;
}

function InviteStep({ user, onBack, step, totalSteps }: { user: User, onBack: () => void, step: number, totalSteps: number }) {
  const [invitedEmail, setInvitedEmail] = useState('');
  const [inviteErrorMessage, setInviteErrorMessage] = useState<string>();
  const [members, setMembers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const inviteMember = async (email: string) => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim()) || email.trim() === "") {
      setInviteErrorMessage("Please enter a valid email address.")
      return
    }

    setInvitedEmail("")
    // create a pending account by calling the invitation API
    const emails = [email];
    request('POST', 'routes/user/invite', {
        data: {
          emails,
        }
      })
      .then(() => {
        const invitedMembers: any = emails.map((email) => {
          return {
            email,
            pending: true
          }
        })
        setMembers(members.concat(invitedMembers))
      })
  }

  const onSubmit = async () => {
    setIsSubmitting(true);
    await axios.put(`${API_ENDPOINT}/routes/user/onboarding/complete`, null, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    });
    // Remove onboarding saved step
    window.localStorage.removeItem(onboardStepLocalStateKey);
    router.reload();
  }

  const isCompleted = true;

  return <>
    <h1 className="text-3xl font-semibold">
      Invite other{' '}<span className="text-primary">members</span> ✉️
    </h1>
    <p className="mt-1 text-gray-600">
      You can also do this later in the app
    </p>
    <ProgressBar step={step} totalSteps={totalSteps} /> 
    <div className="mt-6 space-y-8">
      <div>
      <div className="space-y-5 bg-white rounded-md p-3 shadow-md">
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
              onKeyDown={e => e.key === 'Enter' && inviteMember(invitedEmail)}
              onChange={(e) => {
                setInviteErrorMessage(undefined);
                setInvitedEmail(e.target.value);
              }}
              required
            />
            {inviteErrorMessage && <div className="text-red-500 pt-2 pl-2">{inviteErrorMessage}</div>}
          </div>
          <span className="ml-3">
            <button
              type="button"
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
        {
          members.length > 0 && <div className="mt-8 flex flex-col">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        }
      </div>
      </div>
    </div>
    <NavButtons onBack={onBack} onNext={onSubmit} isLast isCompleted={isCompleted} isSubmitting={isSubmitting} />
  </>;
}