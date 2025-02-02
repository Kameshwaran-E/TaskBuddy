import { useState, useRef, useEffect } from "react";
import { TaskForm } from "../createtask/TaskForm";
import { Task } from "../../types";
import noresult from '../../assets/noresult.png';

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
}

function FilterSection({ filters, tasks, onFilterChange }: FilterSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState(filters.category || "");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.title || "");

  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesTitle = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? task.category === categoryFilter : true;
    return matchesTitle && matchesCategory;
  });

  const noResults = filteredTasks.length === 0;

  const handleCategoryClick = () => setIsCategoryDropdownOpen((prev) => !prev);

  const handleCategorySelect = (category: string) => {
    setCategoryFilter(category);
    onFilterChange({ ...filters, category });
    setIsCategoryDropdownOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      onFilterChange({ ...filters, title: query });
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
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-2 w-full px-4">
      {/* Filter Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full sm:flex-nowrap">
        
        {/* Filter Section */}
        <div className="flex items-center gap-2.5 text-sm font-semibold text-black text-opacity-60">
          <div className="whitespace-nowrap">Filter by:</div>
  
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={handleCategoryClick}
              className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-solid border-black border-opacity-20 rounded-full min-h-[36px] text-sm min-w-[150px] sm:min-w-[200px]"
              aria-expanded={isCategoryDropdownOpen}
              aria-label="Select Category"
            >
              <span>{categoryFilter || "Select Category"}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isCategoryDropdownOpen && (
              <div
                className="cursor-pointer absolute top-full left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-md w-full"
                role="menu"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    aria-selected={category === categoryFilter}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar and Add Task Button in the same line */}
        <div className="flex flex-wrap gap-4 justify-between w-full sm:w-auto">
          <div className="flex items-center px-4 py-2.5 text-sm font-semibold border border-solid border-black border-opacity-40 min-h-[36px] rounded-full text-black text-opacity-80 w-full sm:w-[250px]">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by Title"
              className="text-sm w-full border-none outline-none"
            />
          </div>
  
          <button
            className="px-6 py-3 bg-fuchsia-800 rounded-full text-white font-bold uppercase text-sm w-full sm:w-auto hover:bg-fuchsia-700 transition duration-300"
            onClick={handleAddTaskClick}
          >
            Add Task
          </button>
        </div>
      </div>
  
      {/* Task Form Modal */}
      {isTaskFormVisible && <TaskForm onCancel={handleTaskFormCancel} className={""} />}
  
      {/* No Results Message */}
      {searchQuery && noResults && (
        <div className="flex flex-col items-center justify-center w-full mt-8">
          <img src={noresult} alt="No Results Found" className="max-w-full md:max-w-[400px] h-auto mb-4" />
        </div>
      )}
    </div>
  );
}

export default FilterSection;
