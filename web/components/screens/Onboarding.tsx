import { Combobox } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/solid";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../helpers/api";
import { classNames } from "../../helpers/functions";
import { DocumentationTypeIcon } from "../../helpers/Icons";
import { updateSession } from "../../helpers/session";
import { getSubdomain } from "../../helpers/user";
import { Doc, Org, User } from "../../pages";
import AddDocumentation, { addDocumentationMap, AddDocumentationType } from "../commands/documentation/AddDocumentation";
import DocItem from "../DocItem";
import LoadingItem from "../LoadingItem";
import ProfilePicture from "../ProfilePicture";

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
  { id: '2-5', title: '2 - 10' },
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

const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  return <div className="mt-4 flex space-x-2">
  {[0, 1, 2, 3].map((i) => (
      <>
        {
          i > currentStep && <span key={i} className="h-1 w-14 bg-slate-200 rounded-sm"></span>
        }
        {
          i <= currentStep && <span key={i} className="h-1 w-14 bg-primary rounded-sm"></span>
        }
      </>
    ))
  }
  </div>
}

type NavButtonsProps = {
  onBack: () => void,
  onNext: () => void,
  isCompleted: boolean,
  isFirst?: boolean,
  isLast?: boolean,
}

const NavButtons = ({ onBack, onNext, isFirst, isLast, isCompleted }: NavButtonsProps) => {
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
    >{isLast ? 'Complete' : 'Next'}</button>
  </div>
}

type OnboardingProps = {
  user: User,
  org: Org,
}

export default function Onboarding({ user, org }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const onBack = () => {
    if (step === 0) {
      return;
    }
    setStep(step - 1);
  }

  const onNext = () => {
    if (step === 3) {
      return;
    }
    setStep(step + 1);
  }

  const CurrentStep = () => {
    switch (step) {
      case 0:
        return <Step0 user={user} org={org} onBack={onBack} onNext={onNext} />;
      case 1:
        return <Step1 user={user} org={org} onBack={onBack} onNext={onNext} />;
      case 2:
        return <Step2 user={user} org={org} onBack={onBack} onNext={onNext} />;
      case 3:
        return <Step3 onBack={onBack} />;
      default:
        return null;
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="w-96 max-w-full mx-auto py-12">
          <CurrentStep />
        </div>
      </div>
    </div>
  )
}

function Step0({ user, org, onBack, onNext }: { user: User, org: Org, onBack: () => void, onNext: () => void }) {
  const buildAppsUsing = () => {
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
  const [role, setRole] = useState<string | undefined>(user.onboarding?.role);
  const [teamSize, setTeamSize] = useState<string | undefined>(org.onboarding?.teamSize);
  const [appsUsing, setAppsUsing] = useState<string[]>(buildAppsUsing());

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
    }).then(() => {
      updateSession();
    })
    onNext();
  }

  const isCompleted = role != null && teamSize != null && appsUsing.length > 0;
  
  const currentStep = 0;
  return <>
    <h1 className="text-3xl font-semibold">
      Welcome <span className="text-primary">{user.firstName}</span> 👋
    </h1>
    <p className="mt-1 text-gray-600">
      First things first, tell us about yourself
    </p>
    <ProgressBar currentStep={currentStep} />
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

function Step1({ user, org, onBack, onNext }: { user: User, org: Org, onBack: () => void, onNext: () => void }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isAddingDocOpen, setIsAddingDocOpen] = useState(false);
  const [addDocumentationType, setAddDocumentationType] = useState<AddDocumentationType>();
  const [isAddDocLoading, setIsAddDocLoading] = useState(false);
  const currentStep = 1;

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
      user={user}
      org={org}
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
    <ProgressBar currentStep={currentStep} />
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
        <h1 className="text-lg">Documents added</h1>
        <ul className="mt-2 bg-white rounded-md p-3 shadow-md">
          { isAddDocLoading && <LoadingItem /> }
          {docs.map((doc) => (
            <DocItem
              user={user}
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

function Step2({ user, org, onBack, onNext }: { user: User, org: Org, onBack: () => void, onNext: () => void }) {
  const integrations = [
    {
      type: 'slack',
      title: 'Slack',
      description: 'Connect with your workspace',
      iconSrc: '/assets/integrations/slack.svg',
      isRequired: org.onboarding?.usingSlack,
      installUrl: `${API_ENDPOINT}/routes/integrations/slack/install?org=${org._id}`,
    },
    {
      type: 'github',
      title: 'GitHub',
      description: 'Enable documentation review',
      iconSrc: '/assets/integrations/github.svg',
      isRequired: org.onboarding?.usingGitHub,
      installUrl: `${API_ENDPOINT}/routes/integrations/github/install?org=${org._id}`,
    },
    {
      type: 'vscode',
      title: 'VS Code',
      description: 'Connect code to documentation',
      iconSrc: '/assets/integrations/vscode.svg',
      isRequired: user.onboarding?.usingVSCode,
      installUrl: 'vscode:extension/mintlify.connector',
    }
  ];

  const remainingIntegrations = integrations.filter(({ isRequired }) => isRequired);

  const currentStep = 2;
  const isCompleted = remainingIntegrations.length === 0;

  return <>
    <h1 className="text-3xl font-semibold">
      Let&apos;s get you{' '}<span className="text-primary">integrated</span> 🔌
    </h1>
    <p className="mt-1 text-gray-600">
      Connect with the apps that you use
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div>
        <div className="mt-2 bg-white rounded-md p-3 shadow-md">
        <Combobox onChange={() => {}} value="">
          <Combobox.Options static className="scroll-py-3 overflow-y-auto">
            {remainingIntegrations.map((integration) => (
              <Link key={integration.type} href={integration.installUrl}>
                <Combobox.Option
                  value={integration}
                  className={({ active }) =>
                    classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                  }
                  onClick={() => {}}
                >
                  {({ active }) => (
                    <>
                      <img className="h-5 w-5" src={integration.iconSrc} alt={integration.title} />
                      <div className="ml-4 flex-auto">
                        <p
                          className={classNames(
                            'text-sm font-medium',
                            active ? 'text-gray-900' : 'text-gray-700'
                          )}
                        >
                          {integration.title}
                        </p>
                        <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                          {integration.description}
                        </p>
                      </div>
                      <ChevronRightIcon
                        className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </Combobox.Option>
              </Link>
            ))}
          </Combobox.Options>
      </Combobox>
        </div>
      </div>
    </div>
    <NavButtons onBack={onBack} onNext={onNext} isCompleted={isCompleted} />
  </>;
}

function Step3({ onBack }: { onBack: () => void }) {
  const [invitedEmail, setInvitedEmail] = useState('');
  const currentStep = 3;
  const members: User[] = [];

  const onSubmit = () => {

  }

  const isCompleted = true;

  return <>
    <h1 className="text-3xl font-semibold">
      Invite other{' '}<span className="text-primary">members</span> ✉️
    </h1>
    <p className="mt-1 text-gray-600">
      You can also do this later in the app
    </p>
    <ProgressBar currentStep={currentStep} />
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
              onChange={(e) => {
                // setInviteErrorMessage(undefined)
                setInvitedEmail(e.target.value)
              }}
              required
            />
            {/* {inviteErrorMessage && <div className="text-red-500 pt-2 pl-2">{inviteErrorMessage}</div>} */}
          </div>
          <span className="ml-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                // inviteMember(invitedEmail)
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hover focus:outline-none focus:ring-0 focus:ring-offset-2 sm:w-auto hover:cursor-pointer"
            >
              Add member
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
                              <ProfilePicture size={10} user={member} />
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
    <NavButtons onBack={onBack} onNext={onSubmit} isLast isCompleted={true} />
  </>;
}