'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  admin1: string;
  population: number;
}

interface LocationSearchProps {
  value: string;
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({
  value,
  onLocationSelect,
  placeholder = "Search for city, state, country...",
  className = ""
}: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchLocations(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.searchLocations(searchQuery);
      if (response.success) {
        setResults(response.results);
        setIsOpen(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
  };

  const handleLocationSelect = (location: LocationResult) => {
    setQuery(location.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onLocationSelect(location);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleLocationSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const formatPopulation = (population: number): string => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`;
    }
    return population.toString();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {results.map((location, index) => (
              <Button
                key={`${location.latitude}-${location.longitude}`}
                variant="ghost"
                className={`w-full justify-start p-4 h-auto rounded-none border-b last:border-b-0 ${
                  index === selectedIndex ? 'bg-accent' : ''
                }`}
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left space-y-1">
                    <div className="font-medium text-sm">{location.name}</div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{location.timezone}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{formatPopulation(location.population)}</span>
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {isOpen && results.length === 0 && !isLoading && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1">
          <CardContent className="p-4 text-center text-muted-foreground">
            No locations found for "{query}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}