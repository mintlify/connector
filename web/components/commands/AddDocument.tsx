import { Fragment, useState } from "react"
import { Combobox, Dialog, Transition } from "@headlessui/react"
import { PlusIcon, LinkIcon } from "@heroicons/react/solid"
import { classNames } from "../../helpers/functions"
import { ConfluenceIcon, GoogleDocsIcon, NotionIcon } from "../../helpers/Icons"
import axios from "axios"
import { API_ENDPOINT } from "../../helpers/api"

type AddDocumentProps = {
  userId: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setIsAddingDoc?: (isAddingDoc: boolean) => void
}

export default function AddDocument({ userId, isOpen, setIsOpen, setIsAddingDoc }: AddDocumentProps) {
  const [query, setQuery] = useState("")
  const [placeholder, setPlaceholder] = useState("Add link")
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const actions = [
    {
      name: "Add web page",
      icon: (className: string) => <LinkIcon className={classNames(className, "h-5 w-5")} aria-hidden="true" />,
      filter: () => true,
      isLeastPriority: true,
      onActive: () => setPlaceholder("https://"),
    },
    {
      name: "Add Notion page",
      icon: (className: string, isActive: boolean) => <NotionIcon className={className} isActive={isActive} />,
      filter: (query: string) => !query || query.includes("notion.site"),
      onActive: () => setPlaceholder("https://notion.site/"),
    },
    {
      name: "Add Google docs",
      icon: (className: string, isActive: boolean) => <GoogleDocsIcon className={className} isActive={isActive} />,
      filter: (query: string) => !query || query.includes("docs.google.com"),
      onActive: () => setPlaceholder("https://docs.google.com/"),
    },
    {
      name: "Add Confluence page",
      icon: (className: string, isActive: boolean) => <ConfluenceIcon className={className} isActive={isActive} />,
      filter: (query: string) => !query || query.includes("atlassian.net"),
      onActive: () => setPlaceholder("https://atlassian.net/"),
    },
  ]

  let filteredActions = actions.filter((action) => action.filter(query))
  if (query && filteredActions.length > 1) {
    filteredActions = filteredActions.filter((action) => !action.isLeastPriority)
  }

  const isUrlValid = (str: string): boolean => {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$", // fragment locator
      "i"
    )
    return !!pattern.test(str)
  }

  const isUrlAlive = async (url: string): Promise<boolean> => {
    try {
      const response = await axios.get(url)
      // consider all the websites with status codes less than 400 as valid.
      return response.status < 400
    } catch (error) {
      return false
    }
  }

  const onEnter = async () => {
    if (!query) return

    let formattedQuery: string = query.trim()

    // prepend `https://` to the url if it's missing
    if (!formattedQuery.startsWith("http://") && !formattedQuery.startsWith("https://"))
      formattedQuery = `https://${formattedQuery}`

    // check if the url is valid & the website is alive
    if (!isUrlValid(formattedQuery) || !isUrlAlive(formattedQuery)) {
      setErrorMessage('Invalid URL')
      return
    }

    if (setIsAddingDoc) {
      setIsAddingDoc(true)
    }
    axios
      .post(`${API_ENDPOINT}/routes/docs?userId=${userId}`, {
        url: formattedQuery,
      })
      .then(() => {
        if (setIsAddingDoc) {
          setIsAddingDoc(false)
        }
      })

    setIsOpen(false)
  }

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setQuery("")} appear>
      <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox onChange={() => onEnter()} value={query}>
                <div className="relative rounded-xl">
                  <PlusIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <Combobox.Input
                    className="h-12 w-full rounded-t-xl bg-transparent pl-11 pr-4 border-0 text-gray-800 placeholder-gray-400 sm:text-sm focus:outline-none focus:ring-0"
                    placeholder={placeholder}
                    value={query}
                    onChange={(event) => {
                      setErrorMessage(undefined);
                      setQuery(event.target.value)
                    }}
                    onKeyDown={({ key }: { key: string }) => key === "Enter" && onEnter()}
                  />
                  {
                    errorMessage && <div className="pointer-events-none flex items-center absolute top-3.5 right-4 h-5 bg-red-600 text-white text-xs px-2 rounded-md">
                    {errorMessage}
                  </div>
                  }
                </div>
                <Combobox.Options static className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto">
                  <li className="p-2">
                    <h2 className="sr-only">Quick actions</h2>
                    <ul className="text-sm text-gray-700">
                      {filteredActions.map((action) => (
                        <Combobox.Option
                          key={action.name}
                          value={action}
                          className={({ active }) =>
                            classNames(
                              "flex select-none items-center rounded-md px-3 py-2 cursor-pointer",
                              active ? "bg-primary text-white" : ""
                            )
                          }
                        >
                          {({ active }) => (
                            <>
                              {active && action.onActive()}
                              {action.icon("h-4 w-4 flex-none fill-current", active)}
                              <span className="ml-2 flex-auto truncate">{action.name}</span>
                              <span
                                className={classNames(
                                  "ml-3 flex-none text-xs font-semibold",
                                  active ? "text-green-100" : "text-gray-400"
                                )}
                              >
                                {query && <kbd className="font-sans">⏎</kbd>}
                              </span>
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </ul>
                  </li>
                </Combobox.Options>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
