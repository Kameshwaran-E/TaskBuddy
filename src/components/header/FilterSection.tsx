import { useState, useRef, useEffect } from "react";
import { TaskForm } from "../createtask/TaskForm";
import { Task } from "../../types";
import noresult from '../../assets/noresult.webp';

export interface TaskFilters {
  sortOrder: 'asc' | 'desc';
  title?: string;
  category?: string;
  dueDate?: string | null;
}

const categories = ["Work", "Personal"];

interface FilterSectionProps {
  filters: TaskFilters;
  tasks: Task[];
  onFilterChange: (newFilters: TaskFilters) => void;
  setHasSearched: (value: boolean) => void;
}

function FilterSection({ filters, tasks, onFilterChange, }: FilterSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState(filters.category || "");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.title || "");
  const [hasSearched, setHasSearchedState] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Persist filters in localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('taskFilters');
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setCategoryFilter(parsedFilters.category || "");
      setSearchQuery(parsedFilters.title || "");
      onFilterChange(parsedFilters);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskFilters', JSON.stringify(filters));
  }, [filters]);

  const filteredTasks = tasks.filter((task) => {
    const matchesTitle = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? task.category === categoryFilter : true;
    return matchesTitle && matchesCategory;
  });

  const noResults = filteredTasks.length === 0 && hasSearched;

  const handleCategoryClick = () => setIsCategoryDropdownOpen((prev) => !prev);

  const handleCategorySelect = (category: string) => {
    setCategoryFilter(category);
    setHasSearchedState(true);
    onFilterChange({ 
      ...filters, 
      category 
    });
    setIsCategoryDropdownOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHasSearchedState(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      onFilterChange({ 
        ...filters, 
        title: query 
      });
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleAddTaskClick = () => {
    setIsTaskFormVisible(true);
  };

  const handleTaskFormCancel = () => {
    setIsTaskFormVisible(false);
  };

 

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="flex flex-col gap-4">
        {/* Search Bar - Limited width on desktop */}
        <div className="w-full flex justify-center">
          <div className="w-full sm:w-[400px] flex items-center px-3 sm:px-4 py-2 text-sm font-semibold 
                      border border-solid border-black border-opacity-40 min-h-[36px] rounded-full 
                      text-black text-opacity-80">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by Title"
              className="text-sm w-full border-none outline-none bg-transparent text-center"
            />
          </div>
        </div>

        {/* Category Filter and Add Task on same line */}
        <div className="flex items-center justify-between gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 text-sm font-semibold text-black text-opacity-60 flex-1">
            <div className="hidden sm:block whitespace-nowrap">Filter by:</div>
            <div className="relative flex-1 max-w-[200px]" ref={categoryDropdownRef}>
              <button
                onClick={handleCategoryClick}
                className="cursor-pointer flex items-center justify-between gap-2 px-3 py-2 
                       border border-solid border-black border-opacity-20 rounded-full 
                       min-h-[36px] text-sm w-full"
                aria-expanded={isCategoryDropdownOpen}
                aria-label="Select Category"
              >
                <span className="truncate">{categoryFilter || "Category"}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Category Dropdown */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 z-10 bg-white border border-gray-300 
                            rounded-lg shadow-md w-full mt-1 text-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg 
                             last:rounded-b-lg"
                      aria-selected={category === categoryFilter}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Task Button */}
          <button
            className="cursor-pointer px-4 sm:px-6 py-2 bg-fuchsia-800 rounded-full text-white 
                     font-bold uppercase text-sm whitespace-nowrap hover:bg-fuchsia-700 
                     transition duration-300 min-h-[36px] flex-shrink-0"
            onClick={handleAddTaskClick}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      {isTaskFormVisible && <TaskForm onCancel={handleTaskFormCancel} className={""} />}

      {/* No Results Message */}
      {noResults && (
        <div className="flex flex-col items-center justify-center w-full h-full mt-8">
          <img src={noresult} alt="No Results Found" className="max-w-full md:max-w-[600px] h-full mb-4" />
        </div>
      )}
    </div>
  );
}

export default FilterSection;