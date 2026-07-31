import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SearchInput = ({ className, containerClassName, ...props }) => (
  <div className={cn('app-search-field', containerClassName)}>
    <div className="field-adornment field-adornment--start" aria-hidden="true">
      <Search />
    </div>
    <input
      type="text"
      className={cn('input-field input-field--with-left-icon', className)}
      {...props}
    />
  </div>
);
