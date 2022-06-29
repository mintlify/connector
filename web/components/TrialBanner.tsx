import { XIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "../context/ProfileContext";
import { request } from "../helpers/request";

export default function TrialBanner() {
  const { profile } = useProfile();
  const [isShowingTrialModel, setIsShowingTrialModel] = useState(false);

  const { user, org } = profile;

  useEffect(() => {
    setIsShowingTrialModel(!Boolean(org?.plan?.isHidingModel))
  }, [org]);

  if (user == null || org == null) {
    return null;
  }

  const onHideTrialAlert = () => {
    request('DELETE', 'routes/org/trial/model');
    setIsShowingTrialModel(false);
  }

  const oneDay = 24 * 60 * 60 * 1000;
  const dateCreated = Date.parse(org.createdAt);
  const now = Date.now();
  const daysSinceCreated = Math.round(Math.abs((dateCreated - now) / oneDay));
  const trialDays = 14;
  const daysLeftOfTrial = trialDays - daysSinceCreated;

  if (org?.plan?.name !== 'free' || (!isShowingTrialModel && daysLeftOfTrial > 3)) {
    return null;
  }

  return <div className="relative bg-primary">
    <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
      {
        daysLeftOfTrial > 3 && <>
          <div className="pr-16 sm:text-center sm:px-16">
        <p className="font-medium text-white text-sm">
          <span className="inline">{daysLeftOfTrial} days left on the trial</span>
          <span className="block sm:ml-2 sm:inline-block">
            <Link href="/settings/billing">
              <a className="text-white font-bold underline">
                {' '}
                Upgrade now <span aria-hidden="true">&rarr;</span>
              </a>
            </Link>
          </span>
        </p>
      </div>
      <div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
        <button
          type="button"
          className="flex p-2 rounded-md hover:bg-hover focus:outline-none focus:ring-2 focus:ring-white"
          onClick={onHideTrialAlert}
        >
          <span className="sr-only">Dismiss</span>
          <XIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </button>
      </div>
        </>
      }
      {
        daysLeftOfTrial <= 3 && daysLeftOfTrial > 0 && <>
          <div className="pr-16 sm:text-center sm:px-16">
          <p className="font-medium text-white text-sm">
            <span className="inline">{daysLeftOfTrial} days left on the trial</span>
            <span className="block sm:ml-2 sm:inline-block">
              <Link href="/settings/billing">
                <a className="text-white font-bold underline">
                  {' '}
                  Upgrade now <span aria-hidden="true">&rarr;</span>
                </a>
              </Link>
            </span>
          </p>
        </div>
          </>
        }
      {
        daysLeftOfTrial <= 0 && <>
        <div className="pr-16 sm:text-center sm:px-16">
      <p className="font-medium text-white text-sm">
        <span className="inline">The trial period has ended. Upgrade to a plan to continue</span>
        <span className="block sm:ml-2 sm:inline-block">
          <Link href="/settings/billing">
            <a className="text-white font-bold underline">
              {' '}
              View plans <span aria-hidden="true">&rarr;</span>
            </a>
          </Link>
        </span>
      </p>
    </div>
      </>
      }
    </div>
  </div>
}