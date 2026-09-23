import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

/**
 * SearchSelect - Reusable Searchable Dropdown / Combobox
 * Follows Blibli BLUE design language with instant search filter, keyboard navigation,
 * smart auto-flipping (open upward if near screen bottom), and full accessibility.
 */
export const SearchSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Ketik untuk mencari...',
  icon: Icon = null,
  emptyText = 'Data tidak ditemukan',
  error = false,
  disabled = false,
  showSublabelInTrigger = false,
  showBadgeInTrigger = false,
  clearable = false,
  size = 'md',
  style = {},
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);

  // Selected option lookup (safe against empty/null values)
  const hasValue = value !== null && value !== undefined && value !== '';
  const selectedOption = hasValue 
    ? options.find((opt) => String(opt.value) === String(value))
    : null;

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (opt.isHeader) return true;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const labelMatch = opt.label?.toString().toLowerCase().includes(q);
    const sublabelMatch = opt.sublabel?.toString().toLowerCase().includes(q);
    const badgeMatch = opt.badge?.toString().toLowerCase().includes(q);
    return labelMatch || sublabelMatch || badgeMatch;
  });

  // Calculate opening direction (upward vs downward)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 250px below and more room above, open upward
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening & reset search and highlightedIndex
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsListRef.current) {
      const itemEl = optionsListRef.current.children[highlightedIndex];
      if (itemEl && typeof itemEl.scrollIntoView === 'function') {
        itemEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (opt) => {
    if (!opt || opt.disabled || opt.isHeader) return;
    const syntheticEvent = {
      target: { value: opt.value },
      currentTarget: { value: opt.value }
    };
    onChange?.(opt.value, opt, syntheticEvent);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const syntheticEvent = {
      target: { value: '' },
      currentTarget: { value: '' }
    };
    onChange?.('', null, syntheticEvent);
    setSearchQuery('');
  };

  // Keyboard navigation inside search input
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    const selectableOptions = filteredOptions.filter(o => !o.isHeader && !o.disabled);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectableOptions.length === 0) return;
      setHighlightedIndex(prev => {
        const next = prev + 1;
        return next >= filteredOptions.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectableOptions.length === 0) return;
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredOptions.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (selectableOptions.length > 0) {
        handleSelect(selectableOptions[0]);
      }
    }
  };

  const heightVal = size === 'sm' ? '36px' : size === 'lg' ? '46px' : '42px';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        zIndex: isOpen ? 1000 : 1,
        ...style
      }}
      className={`search-select-container ${className}`}
    >
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            setIsOpen(!isOpen);
          } else if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '0 12px',
          height: heightVal,
          backgroundColor: disabled ? 'var(--neutral-100)' : '#ffffff',
          border: `1.5px solid ${error ? 'var(--red-500)' : isOpen ? 'var(--blue-500)' : 'var(--border-color)'}`,
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          {Icon && (
            <Icon
              size={16}
              color={selectedOption ? 'var(--blue-600)' : 'var(--neutral-400)'}
              style={{ flexShrink: 0 }}
            />
          )}
          {selectedOption ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              {selectedOption.icon && (
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {selectedOption.icon}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--neutral-900)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {selectedOption.label}
              </span>
              {showSublabelInTrigger && selectedOption.sublabel && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--neutral-500)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {selectedOption.sublabel}
                </span>
              )}
              {showBadgeInTrigger && selectedOption.badge && (
                <span
                  style={{
                    fontSize: '0.688rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--blue-50)',
                    color: 'var(--blue-700)',
                    border: '1px solid var(--blue-200)',
                    flexShrink: 0
                  }}
                >
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--neutral-400)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {placeholder}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Hapus pilihan"
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: 'var(--neutral-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            color="var(--neutral-400)"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Dropdown Popup */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(openUpward
              ? { bottom: 'calc(100% + 4px)', top: 'auto' }
              : { top: 'calc(100% + 4px)', bottom: 'auto' }
            ),
            left: 0,
            right: 0,
            zIndex: 1001,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              padding: '8px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--neutral-50)'
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search
                size={14}
                color="var(--neutral-400)"
                style={{
                  position: 'absolute',
                  left: '10px',
                  pointerEvents: 'none'
                }}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  height: '34px',
                  padding: '0 30px 0 32px',
                  fontSize: '0.813rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  color: 'var(--neutral-900)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--neutral-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px'
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={optionsListRef}
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  fontSize: '0.813rem',
                  color: 'var(--neutral-500)'
                }}
              >
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                if (opt.isHeader) {
                  return (
                    <div
                      key={`header-${idx}`}
                      style={{
                        padding: '6px 10px 4px 10px',
                        fontSize: '0.688rem',
                        fontWeight: 700,
                        color: 'var(--neutral-400)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {opt.label}
                    </div>
                  );
                }

                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      opacity: opt.disabled ? 0.5 : 1,
                      backgroundColor: isSelected
                        ? 'var(--blue-50)'
                        : isHighlighted
                        ? 'var(--neutral-100)'
                        : 'transparent',
                      color: isSelected ? 'var(--blue-700)' : 'var(--neutral-800)',
                      transition: 'background-color 0.1s ease',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {opt.icon && (
                        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          {opt.icon}
                        </span>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: isSelected ? 700 : 500 }}>
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--blue-600)' : 'var(--neutral-500)' }}>
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {opt.badge && (
                        <span
                          style={{
                            fontSize: '0.688rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? '#dbeafe' : 'var(--neutral-100)',
                            color: isSelected ? 'var(--blue-700)' : 'var(--neutral-600)'
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check size={16} color="var(--blue-600)" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
