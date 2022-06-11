import { MailIcon, PencilAltIcon, BellIcon as BellIconSolid } from '@heroicons/react/solid'
import { DocumentSearchIcon, DocumentTextIcon } from '@heroicons/react/outline'
import { AddDocumentationType } from '../components/commands/documentation/AddDocumentation'
import { Doc } from '../pages'

export type AddDocumentTypeIconProps = {
  type: AddDocumentationType
  outerSize?: number
  innerSize?: number
  isActive?: boolean
}

export const DocumentationTypeIcon = ({ type, outerSize = 10, innerSize = 6, isActive = false }: AddDocumentTypeIconProps) => {
  switch (type) {
    case 'webpage':
      return (
        <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-green-100 flex items-center justify-center`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-${innerSize} w-${innerSize} text-green-600`}
            viewBox="0 0 640 512"
            fill="currentColor"
          >
            <path d="M172.5 131.1C228.1 75.51 320.5 75.51 376.1 131.1C426.1 181.1 433.5 260.8 392.4 318.3L391.3 319.9C381 334.2 361 337.6 346.7 327.3C332.3 317 328.9 297 339.2 282.7L340.3 281.1C363.2 249 359.6 205.1 331.7 177.2C300.3 145.8 249.2 145.8 217.7 177.2L105.5 289.5C73.99 320.1 73.99 372 105.5 403.5C133.3 431.4 177.3 435 209.3 412.1L210.9 410.1C225.3 400.7 245.3 404 255.5 418.4C265.8 432.8 262.5 452.8 248.1 463.1L246.5 464.2C188.1 505.3 110.2 498.7 60.21 448.8C3.741 392.3 3.741 300.7 60.21 244.3L172.5 131.1zM467.5 380C411 436.5 319.5 436.5 263 380C213 330 206.5 251.2 247.6 193.7L248.7 192.1C258.1 177.8 278.1 174.4 293.3 184.7C307.7 194.1 311.1 214.1 300.8 229.3L299.7 230.9C276.8 262.1 280.4 306.9 308.3 334.8C339.7 366.2 390.8 366.2 422.3 334.8L534.5 222.5C566 191 566 139.1 534.5 108.5C506.7 80.63 462.7 76.99 430.7 99.9L429.1 101C414.7 111.3 394.7 107.1 384.5 93.58C374.2 79.2 377.5 59.21 391.9 48.94L393.5 47.82C451 6.731 529.8 13.25 579.8 63.24C636.3 119.7 636.3 211.3 579.8 267.7L467.5 380z" />
          </svg>
        </div>
      )
    case 'notion':
      return (
        <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
          <svg
            viewBox="13.38 3.2 485.44 505.7"
            className={`h-${innerSize - 1} w-${innerSize - 1}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m186.84 13.95c-79.06 5.85-146.27 11.23-149.43 11.86-8.86 1.58-16.92 7.59-20.71 15.5l-3.32 6.96.32 165.88.47 165.88 5.06 10.28c2.85 5.69 22.14 32.26 43.17 59.61 41.59 53.92 44.59 56.93 60.4 58.51 4.59.47 39.06-1.11 76.38-3.32 37.48-2.37 97.56-6.01 133.62-8.06 154.01-9.35 146.1-8.56 154.95-16.15 11.07-9.17 10.28 5.85 10.75-195.76.32-170.94.16-182.16-2.37-187.38-3-5.85-8.38-9.96-78.59-59.3-46.96-32.89-50.28-34.63-71.32-34.95-8.69-.31-80.48 4.43-159.38 10.44zm177.73 21.66c6.64 3 55.19 36.84 62.3 43.33 1.9 1.9 2.53 3.48 1.58 4.43-2.21 1.9-302.66 19.77-311.35 18.5-3.95-.63-9.8-3-13.12-5.22-13.76-9.33-47.91-37.32-47.91-39.37 0-5.38-1.11-5.38 132.83-15.02 25.62-1.74 67.68-4.9 93.3-6.96 55.49-4.43 72.1-4.27 82.37.31zm95.51 86.5c2.21 2.21 4.11 6.48 4.74 10.59.47 3.8.79 74.64.47 157.18-.47 141.68-.63 150.54-3.32 154.65-1.58 2.53-4.74 5.22-7.12 6.01-6.63 2.69-321.46 20.56-327.94 18.66-3-.79-7.12-3.32-9.33-5.53l-3.8-4.11-.47-152.75c-.32-107.21 0-154.65 1.27-158.92.95-3.16 3.32-6.96 5.38-8.22 2.85-1.9 21.51-3.48 85.71-7.27 45.07-2.53 114.8-6.8 154.81-9.17 95.17-5.86 94.86-5.86 99.6-1.12z"
              fill={isActive ? '#FFF' : '#000'}
            />
            <path
              d="m375.48 174.45c-17.08 1.11-32.26 2.69-34 3.64-5.22 2.69-8.38 7.12-9.01 12.18-.47 5.22 1.11 5.85 18.18 7.91l7.43.95v67.52c0 40.16-.63 66.73-1.42 65.94-.79-.95-23.24-35.1-49.97-75.9-26.72-40.95-48.86-74.64-49.18-74.95-.32-.32-17.71.63-38.58 2.06-25.62 1.74-39.69 3.32-42.54 4.9-4.59 2.37-9.65 10.75-9.65 16.29 0 3.32 6.01 5.06 18.66 5.06h6.64v194.18l-10.75 3.32c-8.38 2.53-11.23 4.11-12.65 7.27-2.53 5.38-2.37 10.28.16 10.28.95 0 18.82-1.11 39.37-2.37 40.64-2.37 45.22-3.48 49.49-11.86 1.27-2.53 2.37-5.22 2.37-6.01 0-.63-5.53-2.53-12.18-4.11-6.8-1.58-13.6-3.16-15.02-3.48-2.69-.79-2.85-5.69-2.85-73.69v-72.9l48.07 75.43c50.44 79.06 56.77 88.08 64.52 92.03 9.65 5.06 34.16 1.58 46.49-6.48l3.8-2.37.32-107.84.47-108 8.38-1.58c9.96-1.9 14.55-6.48 14.55-14.39 0-5.06-.32-5.38-5.06-5.22-2.83.13-19.12 1.08-36.04 2.19z"
              fill={isActive ? '#FFF' : '#000'}
            />
          </svg>
        </div>
      )
    // case 'confluence':
    //   return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
    //       <svg xmlns="http://www.w3.org/2000/svg" className={`h-${innerSize - 1} w-${innerSize - 1}`} viewBox="0 0 256 246" version="1.1" preserveAspectRatio="xMidYMid">
    //         <defs>
    //             <linearGradient x1="99.140087%" y1="112.708084%" x2="33.8589812%" y2="37.7549606%" id="linearGradient-1">
    //                 <stop stopColor={isActive ? '#FFF' : "#0052CC"} offset="18%"/>
    //                 <stop stopColor={isActive ? '#FFF' : "#2684FF"} offset="100%"/>
    //             </linearGradient>
    //             <linearGradient x1="0.92569163%" y1="-12.5823074%" x2="66.1800713%" y2="62.3057471%" id="linearGradient-2">
    //                 <stop stopColor={isActive ? '#FFF' : "#0052CC"} offset="18%"/>
    //                 <stop stopColor={isActive ? '#FFF' : "#2684FF"} offset="100%"/>
    //             </linearGradient>
    //         </defs>
    //         <g>
    //             <path d="M9.26054484,187.329971 C6.61939782,191.637072 3.65318655,196.634935 1.13393863,200.616972 C-1.12098385,204.42751 0.0895487945,209.341911 3.85635171,211.669157 L56.6792921,244.175582 C58.5334859,245.320393 60.7697695,245.67257 62.8860683,245.153045 C65.0023672,244.633521 66.8213536,243.285826 67.9346417,241.412536 C70.0475593,237.877462 72.7699724,233.285929 75.7361837,228.369333 C96.6621947,193.831256 117.710105,198.057091 155.661356,216.179423 L208.037333,241.087471 C210.020997,242.031639 212.302415,242.132457 214.361632,241.366949 C216.420848,240.601441 218.082405,239.034833 218.967618,237.024168 L244.119464,180.137925 C245.896483,176.075046 244.088336,171.3377 240.056161,169.492071 C229.003977,164.291043 207.021507,153.92962 187.233221,144.380857 C116.044151,109.802148 55.5415672,112.036965 9.26054484,187.329971 Z" fill="url(#linearGradient-1)"/>
    //             <path d="M246.11505,58.2319428 C248.756197,53.9248415 251.722408,48.9269787 254.241656,44.9449416 C256.496579,41.1344037 255.286046,36.2200025 251.519243,33.8927572 L198.696303,1.38633231 C196.82698,0.127283893 194.518741,-0.298915762 192.323058,0.209558312 C190.127374,0.718032386 188.241461,2.11550922 187.115889,4.06811236 C185.002971,7.60318607 182.280558,12.1947186 179.314347,17.1113153 C158.388336,51.6493918 137.340426,47.4235565 99.3891748,29.3012247 L47.1757299,4.5150757 C45.1920661,3.57090828 42.9106475,3.47008979 40.8514312,4.2355977 C38.7922149,5.00110562 37.1306578,6.56771434 36.2454445,8.57837881 L11.0935983,65.4646223 C9.31657942,69.5275012 11.1247267,74.2648471 15.1569014,76.1104765 C26.2090859,81.3115044 48.1915557,91.6729274 67.9798418,101.22169 C139.331444,135.759766 199.834028,133.443683 246.11505,58.2319428 Z" fill="url(#linearGradient-2)"/>
    //         </g>
    //     </svg>
    //   </div>
    // case 'googledocs':
    //   return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
    //       <svg version="1.0" className={`h-${innerSize - 1} w-${innerSize - 1}`} xmlns="http://www.w3.org/2000/svg" width="300.000000pt" height="300.000000pt" viewBox="0 0 300.000000 300.000000" preserveAspectRatio="xMidYMid meet">
    //       <g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)" fill={isActive ? '#FFF' : '#4285F4'} stroke="none">
    //       <path d="M205 2927 c-37 -23 -115 -101 -130 -130 -22 -45 -23 -2549 0 -2593
    //       15 -31 96 -111 132 -132 18 -9 297 -12 1291 -12 1090 0 1273 2 1298 15 31 15
    //       111 96 132 132 18 33 18 2553 0 2586 -21 36 -101 117 -132 132 -25 13 -207 15
    //       -1300 14 -965 0 -1276 -3 -1291 -12z m2183 -539 c19 -19 16 -177 -5 -200 -15
    //       -17 -56 -18 -881 -18 -791 0 -867 1 -884 17 -15 13 -18 31 -18 103 0 53 5 91
    //       12 98 17 17 1759 17 1776 0z m-7 -368 c17 -9 19 -22 19 -101 0 -87 -1 -90 -26
    //       -99 -34 -13 -1714 -13 -1748 0 -25 9 -26 12 -26 99 0 75 3 92 18 100 24 14
    //       1736 15 1763 1z m7 -372 c8 -8 12 -45 12 -100 0 -76 -2 -89 -19 -98 -13 -7
    //       -306 -10 -881 -10 -575 0 -868 3 -881 10 -17 9 -19 22 -19 98 0 55 4 92 12
    //       100 17 17 1759 17 1776 0z m0 -360 c8 -8 12 -45 12 -100 0 -86 -1 -89 -26 -98
    //       -16 -6 -347 -10 -874 -10 -527 0 -858 4 -874 10 -25 9 -26 12 -26 98 0 55 4
    //       92 12 100 17 17 1759 17 1776 0z m-774 -364 c13 -5 16 -24 16 -100 0 -92 -1
    //       -95 -26 -104 -15 -6 -212 -10 -489 -10 -277 0 -474 4 -489 10 -25 9 -26 12
    //       -26 99 0 75 3 92 18 100 18 11 968 16 996 5z" id="node1" className="node" fill={isActive ? '#FFF' : '#4285F4'}></path>
    //       </g>
    //     </svg>
    //   </div>
    default:
      return null
  }
}

export const SilencedDocIcon = ({ outerSize = 10, innerSize = 6 }: { outerSize?: number, innerSize?: number }) => {
  return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-red-100 flex items-center justify-center`}>
    <svg className={`h-${innerSize - 1} w-${innerSize- 1}`} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.088 11.0051C12.2162 10.9601 12.327 10.8779 12.4055 10.7696C12.4839 10.6614 12.5262 10.5323 12.5266 10.4V9.75C12.5267 9.66463 12.5094 9.58007 12.4758 9.5012C12.4421 9.42233 12.3927 9.35071 12.3304 9.29045L11.1873 8.1809V5.2C11.1873 3.10895 9.72422 1.34745 7.74214 0.8177C7.54595 0.338 7.0665 0 6.5 0C5.9335 0 5.45405 0.338 5.25785 0.8177C4.37195 1.0543 3.60858 1.5509 3.01731 2.20025L0.946842 0.19045L0 1.10955L12.0532 12.8095L13 11.8904L12.088 11.0051ZM6.5 13C6.91469 13.0005 7.31925 12.8756 7.65743 12.6426C7.99561 12.4096 8.25061 12.0802 8.38699 11.7H4.61301C4.74939 12.0802 5.00439 12.4096 5.34257 12.6426C5.68075 12.8756 6.0853 13.0005 6.5 13ZM1.81266 5.2V8.1809L0.66962 9.29045C0.607317 9.35071 0.557907 9.42233 0.524235 9.5012C0.490563 9.58007 0.473294 9.66463 0.473421 9.75V10.4C0.473421 10.5724 0.54397 10.7377 0.669548 10.8596C0.795126 10.9815 0.965447 11.05 1.14304 11.05H8.42783L1.85819 4.67285C1.83744 4.84705 1.81266 5.0206 1.81266 5.2Z" fill="#AB1212"/></svg>
  </div>
}

export const AutomationTypeIcon = ({
  type,
  outerSize = 10,
  innerSize = 6,
}: {
  type: string
  outerSize?: number
  innerSize?: number
}) => {
  switch (type) {
    case 'code':
      return (
        <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-sky-100 flex items-center justify-center`}>
          <svg
            className={`h-${innerSize} w-${innerSize} text-sky-600`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
          >
            <path
              d="M476.8 288C461.1 361 397.4 416 320 416C242.6 416 178 361 163.2 288H32C14.33 288 0 273.7 0 256C0 238.3 14.33 224 32 224H163.2C178 150.1 242.6 96 320 96C397.4 96 461.1 150.1 476.8 224H608C625.7 224 640 238.3 640 256C640 273.7 625.7 288 608 288H476.8zM320 336C364.2 336 400 300.2 400 256C400 211.8 364.2 176 320 176C275.8 176 240 211.8 240 256C240 300.2 275.8 336 320 336z"
              fill="currentColor"
            />
          </svg>
        </div>
      )
    case 'doc':
      return (
        <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-amber-100 flex items-center justify-center`}>
          <DocumentSearchIcon className={`h-${innerSize} w-${innerSize} text-amber-600`} />
        </div>
      )
    default:
      return null
  }
}

export const ConnectionIcon = ({ outerSize = 10, innerSize = 6 }: { outerSize?: number; innerSize?: number }) => {
  return (
    <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-green-100 flex items-center justify-center`}>
      <svg
        className={`h-${innerSize - 1} w-${innerSize - 1} text-green-700`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="currentColor"
      >
        <path d="M305.8 2.076C314.4 5.932 320 14.52 320 24V64H336C406.7 64 464 121.3 464 192V358.7C492.3 371 512 399.2 512 432C512 476.2 476.2 512 432 512C387.8 512 352 476.2 352 432C352 399.2 371.7 371 400 358.7V192C400 156.7 371.3 128 336 128H320V168C320 177.5 314.4 186.1 305.8 189.9C297.1 193.8 286.1 192.2 279.9 185.8L199.9 113.8C194.9 109.3 192 102.8 192 96C192 89.2 194.9 82.71 199.9 78.16L279.9 6.161C286.1-.1791 297.1-1.779 305.8 2.077V2.076zM432 456C445.3 456 456 445.3 456 432C456 418.7 445.3 408 432 408C418.7 408 408 418.7 408 432C408 445.3 418.7 456 432 456zM112 358.7C140.3 371 160 399.2 160 432C160 476.2 124.2 512 80 512C35.82 512 0 476.2 0 432C0 399.2 19.75 371 48 358.7V153.3C19.75 140.1 0 112.8 0 80C0 35.82 35.82 .0004 80 .0004C124.2 .0004 160 35.82 160 80C160 112.8 140.3 140.1 112 153.3V358.7zM80 56C66.75 56 56 66.75 56 80C56 93.25 66.75 104 80 104C93.25 104 104 93.25 104 80C104 66.75 93.25 56 80 56zM80 408C66.75 408 56 418.7 56 432C56 445.3 66.75 456 80 456C93.25 456 104 445.3 104 432C104 418.7 93.25 408 80 408z" />
      </svg>
    </div>
  )
}

export const TypeIcon = ({ type, className }: { type: string; className: string }) => {
  switch (type) {
    case 'code':
      return (
        <svg
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          width="124"
          height="124"
          viewBox="0 0 124 124"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M62 12C34.375 12 12 34.375 12 62C12 84.125 26.3125 102.812 46.1875 109.437C48.6875 109.875 49.625 108.375 49.625 107.062C49.625 105.875 49.5625 101.937 49.5625 97.75C37 100.062 33.75 94.6875 32.75 91.875C32.1875 90.4375 29.75 86 27.625 84.8125C25.875 83.875 23.375 81.5625 27.5625 81.5C31.5 81.4375 34.3125 85.125 35.25 86.625C39.75 94.1875 46.9375 92.0625 49.8125 90.75C50.25 87.5 51.5625 85.3125 53 84.0625C41.875 82.8125 30.25 78.5 30.25 59.375C30.25 53.9375 32.1875 49.4375 35.375 45.9375C34.875 44.6875 33.125 39.5625 35.875 32.6875C35.875 32.6875 40.0625 31.375 49.625 37.8125C53.625 36.6875 57.875 36.125 62.125 36.125C66.375 36.125 70.625 36.6875 74.625 37.8125C84.1875 31.3125 88.375 32.6875 88.375 32.6875C91.125 39.5625 89.375 44.6875 88.875 45.9375C92.0625 49.4375 94 53.875 94 59.375C94 78.5625 82.3125 82.8125 71.1875 84.0625C73 85.625 74.5625 88.625 74.5625 93.3125C74.5625 100 74.5 105.375 74.5 107.062C74.5 108.375 75.4375 109.937 77.9375 109.437C97.6875 102.812 112 84.0625 112 62C112 34.375 89.625 12 62 12Z"
          />
        </svg>
      )
    case 'doc':
      return <PencilAltIcon className={className} />
    case 'email':
      return <MailIcon className={className} />
    case 'slack':
      return (
        <>
          <BellIconSolid className={className} />#
        </>
      )
    case 'webhook':
      return (
        <svg
          className={className}
          width="124"
          height="124"
          viewBox="0 0 124 124"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_332_18)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M65.4738 47.1079C65.2589 47.1215 65.0436 47.1283 64.8283 47.1282C59.3117 47.1282 54.8327 42.68 54.8327 37.2013C54.8327 31.7226 59.3117 27.2744 64.8283 27.2744C70.3448 27.2744 74.8238 31.7226 74.8238 37.2013C74.8269 39.479 74.0376 41.6879 72.5897 43.4543L83.6384 63.6253C86.3612 62.6424 89.236 62.1396 92.1331 62.1396C105.858 62.1396 117 73.2055 117 86.8358C117 100.466 105.858 111.532 92.1331 111.532C87.2763 111.53 82.5255 110.121 78.4631 107.477C78.0273 107.196 77.6587 106.823 77.3834 106.385C77.1081 105.947 76.9327 105.455 76.8696 104.942C76.8064 104.43 76.857 103.91 77.0179 103.419C77.1787 102.928 77.4458 102.478 77.8005 102.1C77.8078 102.092 77.8156 102.084 77.8303 102.083C78.4266 101.448 79.2281 101.041 80.0955 100.932C80.9628 100.823 81.841 101.02 82.5774 101.488C85.4236 103.319 88.7422 104.293 92.1331 104.293C101.835 104.293 109.711 96.4707 109.711 86.8358C109.711 77.2009 101.835 69.379 92.1331 69.379C88.7736 69.379 84.0055 70.8385 81.139 72.6452C80.9915 72.7553 80.8218 72.8326 80.6415 72.8718C80.4613 72.911 80.2746 72.9112 80.0943 72.8723C79.9139 72.8335 79.7441 72.7566 79.5963 72.6468C79.4485 72.537 79.3263 72.3969 79.2379 72.236L65.4738 47.1079ZM60.8847 90.0183C60.3804 92.8513 59.3814 95.5749 57.9328 98.0663C51.0705 109.871 35.85 113.922 23.9641 107.107C12.0782 100.291 8.00003 85.1749 14.8618 73.3701C17.2921 69.1937 20.8963 65.8122 25.2328 63.6398C25.6961 63.4058 26.2054 63.2754 26.7249 63.2578C27.2444 63.2401 27.7614 63.3356 28.2398 63.5376C28.7183 63.7394 29.1466 64.0428 29.4945 64.4266C29.8424 64.8103 30.1015 65.265 30.2535 65.7588C30.2564 65.7695 30.2593 65.7797 30.2535 65.7927C30.5091 66.6231 30.4635 67.5162 30.1247 68.3167C29.7858 69.1171 29.175 69.7742 28.3987 70.1736C25.379 71.706 22.8702 74.0732 21.1746 76.9898C16.3241 85.3332 19.2067 96.0189 27.6083 100.837C36.0099 105.654 46.7695 102.791 51.62 94.4466C53.2998 91.5572 54.411 86.7264 54.2691 83.3575C54.2465 83.1756 54.2637 82.9909 54.3196 82.8162C54.3754 82.6414 54.4685 82.4807 54.5926 82.345C54.7167 82.2092 54.8688 82.1017 55.0386 82.0296C55.2084 81.9576 55.3918 81.9228 55.5763 81.9276L84.3703 82.6535C84.4653 82.4627 84.5668 82.2743 84.6755 82.0879C87.4338 77.3433 93.552 75.7148 98.3294 78.4541C103.108 81.194 104.747 87.2702 101.988 92.0148C99.2299 96.7594 93.1117 98.3874 88.3338 95.648C86.3462 94.5118 84.8146 92.7287 83.9982 90.6003L60.8847 90.0183ZM48.8159 56.1385C46.5973 54.2879 44.7213 52.0665 43.2725 49.5746C36.4102 37.7703 40.4884 22.6538 52.3743 15.8391C64.2602 9.0244 79.4812 13.0746 86.343 24.8784C88.7698 29.0565 89.9166 33.847 89.643 38.6627C89.6153 39.1783 89.4744 39.6816 89.23 40.1373C88.9857 40.593 88.6438 40.9901 88.2285 41.3006C87.8132 41.6112 87.3345 41.8277 86.826 41.935C86.3175 42.0423 85.7915 42.0377 85.285 41.9217C85.2742 41.9193 85.2635 41.9164 85.2547 41.9047C84.4029 41.7094 83.647 41.2237 83.1186 40.5321C82.5901 39.8405 82.3225 38.9867 82.3624 38.1194C82.5361 34.7559 81.7262 31.4142 80.0302 28.4976C75.1797 20.1542 64.4206 17.2909 56.019 22.1081C47.6179 26.9258 44.7343 37.611 49.5853 45.9549C51.2651 48.8444 54.922 52.2156 57.9304 53.7778C58.1003 53.8495 58.2526 53.9567 58.377 54.0921C58.5014 54.2275 58.595 54.388 58.6514 54.5626C58.7077 54.7372 58.7255 54.9217 58.7036 55.1038C58.6817 55.2858 58.6205 55.461 58.5243 55.6174L43.4939 80.0197C43.6129 80.1964 43.7265 80.378 43.8352 80.5645C46.593 85.3095 44.9537 91.3858 40.1759 94.1251C35.3985 96.8644 29.2803 95.2364 26.522 90.4914C23.7637 85.7468 25.403 79.6705 30.1803 76.9312C32.165 75.7898 34.4858 75.3642 36.7501 75.7264L48.8159 56.1385Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="clip0_332_18">
              <rect width="109" height="106" fill="white" transform="translate(8 9)" />
            </clipPath>
          </defs>
        </svg>
      )
    default:
      return null
  }
}

export const DocTitleIcon = ({ doc }: { doc: Doc }) => {
  return doc.favicon ? (
    <img src={doc.favicon} alt="favicon" className="h-5 w-5 aspect-square rounded-sm" />
  ) : doc.method === 'notion-private' ? (
    <img src="/assets/integrations/notion.svg" alt="favicon" className="h-5 w-5 rounded-sm" />
  ) : (
    <DocumentTextIcon className="h-5 w-5 text-gray-600" />
  )
}
