import { CheckCircleIcon,  ChevronRightIcon } from "@heroicons/react/solid";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../helpers/api";
import { classNames } from "../../helpers/functions";
import { ConnectLinkIcon, DocumentationTypeIcon } from "../../helpers/Icons";
import { getSubdomain } from "../../helpers/user";
import { Org, useProfile, User } from "../../context/ProfileContext";
import { request } from "../../helpers/request";
import Link from "next/link";
import { Code } from "../../pages";
import { onInstallIntegration } from "../../helpers/integrations";
import { GitHubIntegration, VSCodeIntegration } from "../../pages/settings/integrations";

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

const ProgressBar = ({ step }: { step: number }) => {
  return <div className="mt-4 flex space-x-1">
  {Array.from(Array(3).keys()).map((i) => (
      <span key={i} className={classNames(`h-1 w-8 rounded-sm`, i > step ? 'bg-slate-200' : 'bg-primary')}></span>
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
  isSubmitting?: boolean,
}

const NavButtons = ({ onBack, onNext, isFirst, isLast, isCompleted, isSubmitting }: NavButtonsProps) => {
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
  </div>
}

export default function Onboarding() {
  const { profile } = useProfile();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string>();
  const [teamSize, setTeamSize] = useState<string>();

  const { user, org } = profile;

  useEffect(() => {
    if (user == null || org == null) {
      return;
    }
    const step = window.localStorage.getItem(onboardStepLocalStateKey);

    setRole(user.onboarding?.role);
    setTeamSize(org.onboarding?.teamSize);

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
          step={step}
        />;
      case 1:
        return <InstallGitHubStep
          user={user}
          org={org}
          onBack={onBack}
          onNext={onNext}
          step={step}
        />;
      case 2:
        return <ConnectStep
          user={user}
          org={org}
          onBack={onBack}
          step={step}
        />;
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
        <div className="w-96 lg:w-2/5 max-w-full mx-auto py-12">
          <CurrentStep />
        </div>
      </div>
    </div>
    </>
  )
}

function IntroStep({ user, onBack, onNext, role, setRole, teamSize, setTeamSize, step }:
  { user: User, onBack: () => void, onNext: () => void, role: string | undefined, setRole: (role: string) => void, teamSize: string | undefined, setTeamSize: (teamSize: string) => void, step: number }) {
  const onNextFirstPage = async () => {
    axios.post(`${API_ENDPOINT}/routes/user/onboarding`, {
      role,
      teamSize,
    }, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    })
    onNext();
  }

  const isCompleted = role != null && teamSize != null;
  return <>
    <h1 className="text-3xl font-semibold">Welcome <span className="text-primary">{user.firstName}</span> 👋</h1>
    <p className="mt-1 text-gray-600">
      First things first, tell us about yourself
    </p>
    <ProgressBar step={step} /> 
    <div className="mt-6 space-y-8">
      <div>
        <label className="text-base font-medium text-gray-900">What best describes what you do?</label>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
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
      </div>
    <NavButtons onBack={onBack} onNext={onNextFirstPage} isFirst isCompleted={isCompleted} />
  </>;
}

function InstallGitHubStep({ user, org, onBack, onNext, step }: { user: User, org: Org, onBack: () => void, onNext: () => void, step: number }) {
  const router = useRouter();
  const [isGitHubInstalled, setIsGitHubInstalled] = useState<boolean>(false);

  useEffect(() => {
    const statusInterval = setInterval(() => {  
      request('GET', `routes/org/${org._id}/integrations`)
        .then(({ data: { integrations } }) => {
          if (integrations.github) {
            setIsGitHubInstalled(integrations.github || false);
          }
        });
      }, 1000);
    return () => clearInterval(statusInterval);
  }, [user.userId, org]);

  const onInstallGitHub = () => {
    onInstallIntegration(GitHubIntegration(org._id, user.userId), router);
  }

  return <>
    <h1 className="text-3xl font-semibold flex items-center space-x-2">
      <div className="inline">
        Integrate with GitHub
      </div>
      <img src="assets/integrations/github.svg" className="h-6" />
    </h1>
    <p className="mt-1 text-gray-600">
      Enable documentation review in the workflow
    </p>
    <ProgressBar step={step} /> 
    <div className="mt-6">
      <div className="shadow-md">
      <video className="w-full rounded-sm" autoPlay controls muted>
        <source src="assets/videos/workflow.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="rounded-b-sm">
          <button
            className="flex items-center w-full max-h-96 scroll-py-3 overflow-y-auto p-3 bg-white hover:bg-gray-50 cursor-pointer rounded-sm"
            onClick={onInstallGitHub}
          >
            <DocumentationTypeIcon type='github' />
            <div className="ml-4 flex-auto">
              <span className='flex items-center text-sm font-medium text-gray-900 hover:text-gray-700'>
                GitHub App
                { isGitHubInstalled && <CheckCircleIcon className="ml-1 h-4 w-4 text-green-600" /> }
              </span>
              <p className='text-sm text-gray-700 text-left'>
                { isGitHubInstalled ? 'Installed' : 'Click to install' }
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-700" aria-hidden="true" />
          </button>
      </div>
      </div>
      <div className="mt-2">
        <Link href="mailto:hi@mintlify.com?subject=I don't use GitHub, can you support [app]">
          <a target="_blank" className="text-gray-500 hover:text-gray-700 text-sm">
            Not using GitHub?
          </a>
        </Link>
      </div>
    </div>
    <NavButtons onBack={onBack} onNext={onNext} isCompleted={isGitHubInstalled} />
  </>;
}

function ConnectStep({ user, org, onBack, step }: { user: User, org: Org, onBack: () => void, step: number }) {
  const router = useRouter();
  const [isVSCodeInstalled, setIsVScodeInstalled] = useState(false);
  const [codes, setCodes] = useState<Code[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const statusInterval = setInterval(() => {  
      request('GET', `routes/org/${org._id}/integrations`)
        .then(({ data: { integrations } }) => {
          setIsVScodeInstalled(integrations.vscode || false);
        });
      
      request('GET', `routes/links`)
        .then(({ data: { codes } }) => {
          setCodes(codes);
        });
      }, 1000);
    
    return () => clearInterval(statusInterval);
  }, [user, org._id]);

  const onInstallVSCode = () => {
    onInstallIntegration(VSCodeIntegration(), router);
  }

  const onComplete = async () => {
    setIsSubmitting(true);
    await request('PUT', `routes/user/onboarding/complete`)
    setIsSubmitting(false);
    // Remove onboarding saved step
    window.localStorage.removeItem(onboardStepLocalStateKey);
    router.reload();
  }

  const isConnectionMade = codes.length > 0;

  return <>
    <h1 className="text-3xl font-semibold flex items-center space-x-2">
      <div className="inline">
        Connect code to docs
      </div>
      <ConnectLinkIcon className="h-6 w-6" />
    </h1>
    <p className="mt-1 text-gray-600">
      Bring documentation to where it&apos;s relevant
    </p>
    <ProgressBar step={step} /> 
    <div className="mt-6">
      <div className="shadow-md">
      <video className="w-full rounded-sm" autoPlay controls muted>
        <source src="assets/videos/connect.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="rounded-b-sm">
        <button onClick={onInstallVSCode} className="flex items-center max-h-96 scroll-py-3 overflow-y-auto w-full p-3 bg-white hover:bg-gray-50 cursor-pointer rounded-sm">
          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <img src="assets/integrations/vscode.svg" alt="VSCode" className="h-6" />
          </div>
          <div className="ml-4 flex-auto">
            <div className='flex items-center text-sm font-medium text-gray-900 hover:text-gray-700'>
              Install VS Code Extension
              { isVSCodeInstalled && <CheckCircleIcon className="ml-1 h-4 w-4 text-green-600" /> }
            </div>
            <div className='text-sm text-gray-700 text-left'>
              { isVSCodeInstalled ? 'Installed' : 'Click to install' }
            </div>
          </div>
          {
            !isVSCodeInstalled && <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-700" aria-hidden="true" />
          }
        </button>
          {
            codes.map((code) => (
              <Link href={code.url} key={code._id}>
                <a target="_blank" className="flex items-center max-h-96 scroll-py-3 overflow-y-auto p-3 bg-white hover:bg-gray-50 cursor-pointer rounded-sm">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center border-green-200 border-2">
                    <ConnectLinkIcon className="h-5" />
                  </div>
                  <div className="ml-4 flex-auto">
                    <span className='flex items-center text-sm font-medium text-gray-900 hover:text-gray-700'>
                      {code.file}
                    </span>
                    <p className='text-sm text-gray-500'>
                      {code.doc?.title}
                    </p>
                  </div>
                </a>
              </Link>
            ))
          }
          {
            isVSCodeInstalled &&
          <div className="flex items-center max-h-96 scroll-py-3 overflow-y-auto p-3 bg-white rounded-sm">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 animate-spin"
                viewBox="0 0 512 512"
                fill="currentColor"
              >
                <path d="M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z" />
              </svg>
            </div>
            <div className="ml-4 flex-auto">
              <span className='flex items-center text-sm font-medium text-gray-900 hover:text-gray-700'>
               {isConnectionMade ? 'Listening for more connections' : 'Create a connection to continue' }
              </span>
              <p className='text-sm text-gray-700'>
                Listening for changes
              </p>
            </div>
          </div>
          }
      </div>
      </div>
      <div className="mt-2">
        <Link href="mailto:hi@mintlify.com?subject=I don't use VS Code, can you support [app]">
          <a target="_blank" className="text-gray-500 hover:text-gray-700 text-sm">
            Not using VS Code?
          </a>
        </Link>
      </div>
      </div>
    <NavButtons onBack={onBack} onNext={onComplete} isLast isSubmitting={isSubmitting} isCompleted={isConnectionMade} />
  </>;
}