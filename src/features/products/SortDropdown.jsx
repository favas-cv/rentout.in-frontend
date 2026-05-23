import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { setOrdering, selectOrdering } from '../../store/filterSlice';

const SORT_OPTIONS = [
  { label: 'Default',             value: '' },
  { label: 'Price: Low → High',   value: 'price_per_day' },
  { label: 'Price: High → Low',   value: '-price_per_day' },
  { label: 'Latest first',        value: '-created_at' },
  { label: 'Title A → Z',         value: 'title' },
  { label: 'Title Z → A',         value: '-title' },
];

const SortDropdown = () => {
  const dispatch = useDispatch();
  const ordering = useSelector(selectOrdering);

  const activeLabel = SORT_OPTIONS.find((o) => o.value === ordering)?.label ?? 'Sort';

  return (
    <div className="relative min-w-[170px]">
      <ArrowUpDown
        size={13}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <select
        id="product-sort"
        value={ordering}
        onChange={(e) => dispatch(setOrdering(e.target.value))}
        className="
          w-full appearance-none pl-8 pr-8 py-2.5 text-sm font-medium
          bg-white border border-slate-200 rounded-xl cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#635465]/25 focus:border-[#635465]
          text-slate-700 transition-all
        "
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
};

export default SortDropdown;
