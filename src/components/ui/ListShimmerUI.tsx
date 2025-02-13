import React from 'react'

const ListShimmerUI: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((section) => (
        <div key={section} className="border-b mb-4">
          <div className="flex justify-between items-center p-4 h-20 rounded-xl bg-gray-200">
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col rounded-lg border border-gray-200 bg-zinc-100 min-h-[200px]">
              <div className="flex items-center justify-between p-4 rounded-t-lg bg-gray-200">
                <div className="h-6 w-24 bg-gray-300 rounded"></div>
                <div className="h-6 w-8 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3 flex-grow">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="flex-grow space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="flex gap-4">
                          <div className="h-3 w-16 bg-gray-100 rounded-full"></div>
                          <div className="h-3 w-24 bg-gray-100 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ListShimmerUI 