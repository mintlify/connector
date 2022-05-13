import Skeleton from 'react-loading-skeleton'

const LoadingItem = () => {
  return (
    <div>
      <div className="ml-4 mr-6 h-px bg-gray-200 sm:ml-6 lg:ml-8 xl:ml-6 xl:border-t-0"></div>
      <li
        className="relative pl-4 pr-6 py-5 bg-gray-50 sm:pl-6 lg:pl-8 xl:pl-6 cursor-pointer"
      >
        <div className="flex items-center justify-between space-x-4">
          {/* Repo name and link */}
          <div className="min-w-0 space-y-2">
            <div className="flex items-center space-x-3">
              <span className="block">
                <h2 className="text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-56">
                      <Skeleton />
                    </div>
                  </div>
                </h2>
              </span>
            </div>
            <a className="relative group flex items-center space-x-2.5">
              <span className="flex items-center space-x-2.5 text-sm text-gray-500 truncate">
                <div className="w-32">
                  <Skeleton />
                </div>
              </span>
            </a>
          </div>
        </div>
      </li>
      </div>
  )
}

export default LoadingItem;