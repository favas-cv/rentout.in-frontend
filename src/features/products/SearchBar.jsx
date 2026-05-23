import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { setSearch, selectSearch } from '../../store/filterSlice';

/**
 * SearchBar — local input with 500ms debounce.
 *
 * The user types freely; we only commit to Redux (and therefore trigger
 * an API call) after the debounce settles. This prevents a request on
 * every single keystroke.
 */
const SearchBar = () => {
  const dispatch      = useDispatch();
  const committedSearch = useSelector(selectSearch);

  // Local draft — what the user is typing RIGHT NOW
  const [draft, setDraft] = useState(committedSearch);

  // Debounced version of the draft — only updates after 500ms of no typing 
  const debounced = useDebounce(draft, 500);

  // When debounced value settles, push it to Redux (triggers API call)
  React.useEffect(() => {
    // Require at least 2 chars to search; empty string clears the filter
    const value = debounced.length >= 2 ? debounced : '';
    dispatch(setSearch(value));
  }, [debounced, dispatch]);

  const handleClear = () => {
    setDraft('');
    dispatch(setSearch(''));
  };

  return (
    <div className="relative w-full">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        id="product-search"
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Search products… (min. 2 chars)"
        className="
          w-full pl-9 pr-8 py-2.5 text-sm
          bg-slate-50 border border-slate-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-[#635465]/25 focus:border-[#635465]
          transition-all placeholder:text-slate-400
        "
      />
      {draft && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <X size={13} />
        </button>
      )}
      {/* Inline hint — only shown while typing below threshold */}
      {draft.length === 1 && (
        <p className="absolute -bottom-5 left-0 text-[10px] text-amber-500 font-medium">
          Type 1 more character…
        </p>
      )}
    </div>
  );
};

export default SearchBar;
