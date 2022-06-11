import { DocumentationTypeIcon } from '../../../helpers/Icons'
import { Org, User } from '../../../pages'
import { addDocumentationMap, AddDocumentationType } from './AddDocumentation'
import AddNotion from './AddNotion'
import AddWebpage from './AddWebpage'
import AddGoogleDocs from './AddGoogleDocs'

type DocConfigSettings = {
  inputComponent: JSX.Element | null
}

type DocumentationConfigProps = {
  user: User
  org: Org
  isInstalled: boolean
  documentationType?: AddDocumentationType
  onCancel: () => void
  setIsAddDocumentationOpen: (isOpen: boolean) => void
  setIsAddDocLoading: (isAddingAutomation: boolean) => void
}

export default function DocumentationConfig({
  user,
  org,
  documentationType,
  isInstalled,
  onCancel,
  setIsAddDocumentationOpen,
  setIsAddDocLoading,
}: DocumentationConfigProps) {
  if (documentationType == null) {
    return null
  }

  const configOptions: Record<AddDocumentationType, DocConfigSettings> = {
    webpage: {
      inputComponent: AddWebpage({ user, onCancel, setIsAddDocumentationOpen, setIsAddDocLoading }),
    },
    notion: {
      inputComponent: AddNotion({ user, org, isInstalled, onCancel, setIsAddDocumentationOpen, setIsAddDocLoading }),
    },
    google: {
      inputComponent: AddGoogleDocs({ user, org, isInstalled, onCancel, setIsAddDocumentationOpen, setIsAddDocLoading }),
    },
    // confluence: {
    //   inputComponent: null,
    // },
  }

  const ruleData = addDocumentationMap[documentationType]
  const ConfigureInput = () => {
    return configOptions[documentationType].inputComponent
  }

  return (
    <div className="px-6 py-6 z-10">
      <div>
        <div className="flex space-x-4">
          <DocumentationTypeIcon type={documentationType} />
          <div>
            <h1 className="text-sm font-medium text-gray-900">{ruleData.title}</h1>
            <p className="text-sm text-gray-500">{ruleData.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <ConfigureInput />
        </div>
      </div>
    </div>
  )
}
