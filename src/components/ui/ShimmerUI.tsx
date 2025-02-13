import React from 'react'

const ShimmerUI: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-2 animate-pulse">
      {[1, 2, 3].map((column) => (
        <div key={column} className="flex flex-col rounded-lg border border-gray-200 bg-zinc-100 min-h-[300px]">
          <div className="flex items-center justify-between p-4 rounded-t-lg bg-gray-200">
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
            <div className="h-6 w-8 bg-gray-300 rounded-full"></div>
          </div>

          <div className="p-4 space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
                  <div className="h-3 w-24 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ShimmerUI 