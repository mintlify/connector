import Layout from '../../components/layout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { CheckIcon } from '@heroicons/react/solid'
import { navigation } from './account'
import { useProfile } from '../../context/ProfileContext'
import { classNames } from '../../helpers/functions'
import { API_ENDPOINT, ISDEV } from '../../helpers/api'
import Link from 'next/link'

type Tier = {
  id: string,
  name: string,
  monthly: {
    price: number,
    priceId?: string,
  }
  yearly: {
    price: number,
    priceId?: string,
  },
  featuresLabel: string,
  description: string,
  includedFeatures: string[],
}

const tiers: Tier[] = [
  {
    id: 'pro',
    name: 'Pro',
    monthly: {
      price: 50,
      priceId: ISDEV ? 'price_1L7ariIslOV3ufr2mnZzFVFK' : 'price_1L7apaIslOV3ufr25WKIF3hX',
    },
    yearly: {
      price: 40,
      priceId: ISDEV ? 'price_1LC85UIslOV3ufr23xDxmChm' : 'price_1L7apaIslOV3ufr2k7zGiTds',
    },
    featuresLabel: 'What\'s included',
    description: 'Automating world class documentation',
    includedFeatures: [
      'Unlimited documents',
      'Track documents from any platform',
      'Workflow automations',
      'Unlimited members and ownership assignments',
      'Integrating with task management systems',
      'On-call support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: {
      price: -1,
    },
    yearly: {
      price: -1,
    },
    featuresLabel: 'Includes Pro, plus',
    description: 'Built for your enterprises at scale',
    includedFeatures: ['SSO and custom authentication', 'Enterprise-grade security and governance', 'Custom domain', 'API access', 'Premium support', 'Tailored onboarding'],
  },
]

function PurchaseButton({ tier, currentPlan }: { tier: Tier, currentPlan: string }) {
  if (currentPlan === tier.id) {
    return <span
      className="mt-8 block w-full bg-white border border-gray-800 rounded-md py-2 text-sm font-semibold text-gray-700 text-center"
    >
      Current plan
    </span>
  }

  if (tier.id === 'enterprise') {
    return <Link href="mailto:hi@mintlify.com?subject=Upgrading to Enterprise">
      <a
        className="mt-8 block w-full bg-gray-700 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-800"
        id="checkout-and-portal-button"
        target="_blank"
      >
        Contact us
      </a>
    </Link>
  }

  if (tier.id === 'pro' && currentPlan === 'free') {
    return <button
    className="mt-8 block w-full bg-gray-700 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-800"
    id="checkout-and-portal-button"
    type="submit"
  >
    Upgrade now
  </button>
  }

  return <button
    className="mt-8 block w-full bg-gray-700 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-800"
    id="checkout-and-portal-button"
    type="submit"
  >
    Downgrade
  </button>
}

export default function Settings() {
  const { profile, isLoadingProfile } = useProfile();
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('year');
  const router = useRouter();

  useEffect(() => {
    const { user, org } = profile;
    if (user == null || org == null) {
      if (!isLoadingProfile) {
        router.push('/')
      }
      return
    }
  }, [profile, isLoadingProfile, router]);

  const { user, org } = profile;
  if (isLoadingProfile || user == null || org == null) {
    return null;
  }

  const currentPlan = org.plan?.name || 'free';
  const isMonthly = billingPeriod === 'month';

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
            <div className="shadow sm:rounded-md">
              <div className="bg-white pt-6 pb-8 px-4 space-y-4 sm:px-6">
                <div className="sm:flex sm:flex-col sm:align-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Billing</h3>
                    <p className="mt-1 text-sm text-gray-500">Our plans scale with you as you grow</p>
                  </div>
                  <div className="relative w-full self-center mt-2 bg-gray-100 rounded-lg p-0.5 flex sm:mt-4">
                    <button
                      type="button"
                      className={classNames(billingPeriod === 'year' ? 'bg-white text-gray-900 border-gray-200 rounded-md shadow-sm' : 'text-gray-700 border-trasparent' ,"ring-0 relative w-1/2 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:px-8")}
                      onClick={() => setBillingPeriod('year')}
                    >
                      Yearly
                    </button>
                    <button
                      type="button"
                      className={classNames(billingPeriod === 'month' ? 'bg-white text-gray-900 border-gray-200 rounded-md shadow-sm' : 'text-gray-700 border-trasparent' ,"relative w-1/2 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:px-8")}
                      onClick={() => setBillingPeriod('month')}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
                  {tiers.map((tier) => (
                    <div key={tier.name} className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
                      <div className="p-6">
                        <h2 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h2>
                        <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                        <p className="mt-8">
                          {
                            tier.monthly.price >= 0 && <>
                            <span className="text-4xl font-medium text-gray-900">${isMonthly ? tier.monthly.price : tier.yearly.price}</span>{' '}
                            <span className="text-base font-medium text-gray-500">/mo</span>
                            </>
                          }
                          {
                            tier.monthly.price < 0 && <span className="text-3xl font-medium text-gray-900">Contact us</span>
                          }
                        </p>
                        <form action={`${API_ENDPOINT}/routes/stripe/${tier.id === 'free' ? 'portal' : 'checkout'}`} method="GET">
                          <input type="hidden" name="priceId" value={isMonthly ? tier.monthly.priceId : tier.yearly.priceId} /> 
                          <input type="hidden" name="orgId" value={org._id} /> 
                          <input type="hidden" name="email" value={user.email} /> 
                          <PurchaseButton
                            tier={tier}
                            currentPlan={currentPlan}
                          />
                        </form>
                      </div>
                      <div className="pt-6 pb-8 px-6">
                        <h3 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">{tier.featuresLabel}</h3>
                        <ul role="list" className="mt-6 space-y-4">
                          {tier.includedFeatures.map((feature) => (
                            <li key={feature} className="flex space-x-2">
                              <span className="text-sm text-slate-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
