import React, { useState, useEffect, useRef } from 'react';
import { create, props } from '@stylexjs/stylex';
import { Citation } from './CitationLine';
import ClassifierTagChip, { Classifier } from './ClassifierTagChip';

interface ClassifyCitationProps {
  citation: Citation;
  onClassifierAdded?: (classifier: Classifier, citationId: number) => void;
}

// Styles for the component
const styles = create({
  container: {
    width: '100%',
    marginTop: '0.5rem',
    padding: '0.5rem 0',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    maxHeight: '200px',
    overflowY: 'auto',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 10,
  },
  dropdownItem: {
    padding: '0.5rem',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  selectedItem: {
    backgroundColor: '#e5e7eb',
  },
  createNew: {
    padding: '0.5rem',
    color: '#3b82f6',
    fontWeight: 'bold',
    borderTop: '1px solid #d1d5db',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  matchHighlight: {
    backgroundColor: '#fef3c7',
    fontWeight: 'bold',
  },
  aliasesList: {
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  badgeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    marginTop: '0.5rem',
  },
});

const ClassifyCitation: React.FC<ClassifyCitationProps> = ({ citation, onClassifierAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classifiers, setClassifiers] = useState<Classifier[]>([]);
  const [filteredClassifiers, setFilteredClassifiers] = useState<Classifier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [appliedClassifiers, setAppliedClassifiers] = useState<Classifier[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all classifiers on component mount
  useEffect(() => {
    const fetchClassifiers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8081/classifiers');
        if (!response.ok) {
          throw new Error(`Error fetching classifiers: ${response.status}`);
        }
        const data = await response.json();
        setClassifiers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching classifiers:', err);
        setError('Failed to load classifiers');
      } finally {
        setLoading(false);
      }
    };

    fetchClassifiers();
  }, []);

  // Fetch applied classifiers when citation changes
  useEffect(() => {
    const fetchAppliedClassifiers = async () => {
      if (!citation.id) return;
      
      try {
        setLoading(true);
        console.log(`Fetching applied classifiers for citation ${citation.id}`);
        
        const response = await fetch(`http://localhost:8081/citations/${citation.id}`);
        if (!response.ok) {
          throw new Error(`Error fetching citation: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Citation data with classifiers:', data);
        
        if (data.classifiers && Array.isArray(data.classifiers)) {
          // Ensure all classifiers have the aliases property defined
          const safeClassifiers = data.classifiers.map((c: Partial<Classifier>) => ({
            ...c,
            aliases: c.aliases || []
          }));
          
          setAppliedClassifiers(safeClassifiers as Classifier[]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching applied classifiers:', err);
        setError('Failed to load applied classifiers');
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedClassifiers();
  }, [citation.id]);

  // Filter classifiers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClassifiers([]);
      setShowDropdown(false);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Filter by both referredToAs and aliases
    const filtered = classifiers.filter((classifier) => {
      // Check if it matches the main name
      const matchesName = classifier.referredToAs.toLowerCase().includes(lowerSearchTerm);
      
      // Check if it matches any alias
      const matchesAlias = Array.isArray(classifier.aliases) && classifier.aliases.some(
        alias => alias.toLowerCase().includes(lowerSearchTerm)
      );
      
      return matchesName || matchesAlias;
    });
    
    setFilteredClassifiers(filtered);
    setShowDropdown(filtered.length > 0 || searchTerm.trim() !== '');
    setSelectedIndex(-1);
  }, [searchTerm, classifiers]);

  const createClassifier = async () => {
    if (searchTerm.trim() === '') return;
    
    try {
      // First check if a classifier with this name already exists
      const existingClassifier = classifiers.find(
        c => c.referredToAs.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      
      // If we found an existing classifier, use it directly instead of making the API call
      if (existingClassifier) {
        console.log("Using existing classifier found in local state:", existingClassifier);
        
        // Ensure aliases is defined
        const safeClassifier = {
          ...existingClassifier,
          aliases: existingClassifier.aliases || []
        };
        
        // Link the existing classifier to the citation
        if (citation.id) {
          try {
            await linkClassifierToCitation(safeClassifier.id, citation.id);
            
            // Only add to applied classifiers if not already there
            if (!appliedClassifiers.some(c => c.id === safeClassifier.id)) {
              setAppliedClassifiers([...appliedClassifiers, safeClassifier]);
            }
            
            // Clear search term and focus input
            setSearchTerm('');
            if (inputRef.current) {
              inputRef.current.focus();
            }
          } catch (linkError) {
            console.error('Error linking existing classifier:', linkError);
            setError('Failed to apply classifier to citation');
          }
          return;
        }
      }
      
      // If no existing classifier was found, create a new one
      setLoading(true);
      const response = await fetch('http://localhost:8081/classifiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referredToAs: searchTerm.trim(),
          aliases: []
        }),
      });
      
      let newClassifier;
      
      // Handle the case when classifier already exists (409 Conflict)
      if (response.status === 409) {
        const errorData = await response.json();
        console.log("Classifier already exists per API, using existing one:", errorData);
        
        // If the API returns the existing classifier in the response, use it
        if (errorData.classifier) {
          newClassifier = {
            ...errorData.classifier,
            aliases: errorData.classifier.aliases || []
          };
        } else {
          // Try one more time to find by name (may have been added since our initial check)
          const retryExistingClassifier = classifiers.find(
            c => c.referredToAs.toLowerCase() === searchTerm.trim().toLowerCase()
          );
          
          if (retryExistingClassifier) {
            newClassifier = {
              ...retryExistingClassifier,
              aliases: retryExistingClassifier.aliases || []
            };
          } else {
            // Refresh classifiers list to find the one that conflicts
            try {
              const refreshResponse = await fetch('http://localhost:8081/classifiers');
              if (refreshResponse.ok) {
                const refreshedClassifiers = await refreshResponse.json();
                setClassifiers(refreshedClassifiers);
                
                // Find the classifier with matching name
                const matchedClassifier = refreshedClassifiers.find(
                  (c: Classifier) => c.referredToAs.toLowerCase() === searchTerm.trim().toLowerCase()
                );
                
                if (matchedClassifier) {
                  // Ensure aliases is defined for the found classifier
                  newClassifier = {
                    ...matchedClassifier,
                    aliases: matchedClassifier.aliases || []
                  };
                } else {
                  throw new Error('Could not find existing classifier after refresh');
                }
              } else {
                throw new Error('Failed to refresh classifiers list');
              }
            } catch (refreshError) {
              console.error('Error refreshing classifiers:', refreshError);
              throw new Error(`Classifier exists but could not be retrieved: ${errorData.message || 'Unknown error'}`);
            }
          }
        }
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create classifier');
      } else {
        // Normal case - new classifier created
        const createdClassifier = await response.json();
        
        // Ensure aliases is defined
        newClassifier = {
          ...createdClassifier,
          aliases: createdClassifier.aliases || []
        };
        
        setClassifiers([...classifiers, newClassifier]);
      }
      
      // Link the classifier to the citation
      if (citation.id && newClassifier.id) {
        await linkClassifierToCitation(newClassifier.id, citation.id);
        
        // Only add to applied classifiers if not already there
        if (!appliedClassifiers.some(c => c.id === newClassifier.id)) {
          setAppliedClassifiers([...appliedClassifiers, newClassifier]);
        }
      }
      
      // Clear the search term after adding the classifier
      setSearchTerm('');
      setError(null);

      // Focus the input to allow adding more classifiers
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Error creating classifier:', err);
      setError(err instanceof Error ? err.message : 'Failed to create classifier');
    } finally {
      setLoading(false);
    }
  };

  const selectClassifier = async (classifier: Classifier) => {
    if (!citation.id) {
      setError('Cannot classify: Citation ID is missing');
      return;
    }
    
    // Check if this classifier is already applied to avoid duplicate requests
    if (appliedClassifiers.some(c => c.id === classifier.id)) {
      setSearchTerm('');
      setShowDropdown(false);
      return; // Silently return if already applied
    }
    
    try {
      await linkClassifierToCitation(classifier.id, citation.id);
      setAppliedClassifiers([...appliedClassifiers, classifier]);
      
      // Clear the search term after adding the classifier
      setSearchTerm('');
      setShowDropdown(false);

      // Focus the input to allow adding more classifiers
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Error linking classifier to citation:', err);
      setError('Failed to apply classifier to citation');
    }
  };

  const linkClassifierToCitation = async (classifierId: number, citationId: number) => {
    try {
      console.log(`Attempting to link classifier ${classifierId} to citation ${citationId}`);
      
      // Make the API call without a Content-Type header since we're not sending a body
      const response = await fetch(`http://localhost:8081/classifiers/${classifierId}/citations/${citationId}`, {
        method: 'POST'
        // No headers at all - let the browser use default headers but not set Content-Type
      });
      
      console.log(`Link response status: ${response.status}`);
      
      // Handle specific error cases
      if (response.status === 400) {
        const errorData = await response.json();
        console.error('Bad Request when linking classifier:', errorData);
        throw new Error(errorData.message || 'Invalid classifier or citation IDs');
      } else if (response.status === 404) {
        const errorData = await response.json();
        console.error('Not Found when linking classifier:', errorData);
        throw new Error(errorData.message || 'Classifier or citation not found');
      } else if (response.status === 409) {
        // If relationship already exists, don't treat as an error
        console.log('Classifier already linked to citation');
        return { message: 'Classifier already linked to citation' };
      } else if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response when linking:', errorData);
        throw new Error(errorData.message || 'Failed to link classifier to citation');
      }
      
      const result = await response.json();
      console.log('Successfully linked classifier to citation:', result);
      
      // Refresh the applied classifiers to ensure UI is in sync with DB
      // This is optional but helps ensure what we display matches reality
      if (citation.id) {
        try {
          const refreshResponse = await fetch(`http://localhost:8081/citations/${citation.id}`);
          if (refreshResponse.ok) {
            const citationData = await refreshResponse.json();
            if (citationData.classifiers) {
              setAppliedClassifiers(citationData.classifiers);
            }
          }
        } catch (refreshError) {
          console.warn('Failed to refresh citation data:', refreshError);
          // Non-critical error, so we don't throw
        }
      }
      
      // Call the callback if provided
      if (onClassifierAdded) {
        const matchedClassifier = classifiers.find(c => c.id === classifierId);
        if (matchedClassifier) {
          const safeClassifier = {
            ...matchedClassifier,
            aliases: matchedClassifier.aliases || []
          };
          onClassifierAdded(safeClassifier, citationId);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in linkClassifierToCitation:', error);
      throw error; // Re-throw to be handled by caller
    }
  };

  const removeClassifierFromCitation = async (classifierId: number) => {
    if (!citation.id) {
      setError('Cannot remove classifier: Citation ID is missing');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/classifiers/${classifierId}/citations/${citation.id}`, {
        method: 'DELETE'
        // No headers at all - let the browser use default headers but not set Content-Type
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove classifier from citation');
      }
      
      // Remove the classifier from the applied list
      setAppliedClassifiers(appliedClassifiers.filter(c => c.id !== classifierId));
      setError(null);
    } catch (err) {
      console.error('Error removing classifier from citation:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove classifier from citation');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    
    // Handle arrow up/down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredClassifiers.length ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === -1 || selectedIndex === filteredClassifiers.length) {
        // Create new classifier
        createClassifier();
      } else if (selectedIndex >= 0 && selectedIndex < filteredClassifiers.length) {
        // Select existing classifier
        selectClassifier(filteredClassifiers[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Highlight matching text in dropdown items
  const highlightMatch = (text: string) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => (
          regex.test(part) ? 
            <span key={i} {...props(styles.matchHighlight)}>{part}</span> : 
            <span key={i}>{part}</span>
        ))}
      </>
    );
  };

  return (
    <div {...props(styles.container)}>
      {/* Applied classifiers (chips) */}
      {appliedClassifiers.length > 0 && (
        <div {...props(styles.badgeContainer)}>
          {appliedClassifiers.map((classifier) => (
            <ClassifierTagChip 
              key={classifier.id} 
              classifier={classifier} 
              onRemove={removeClassifierFromCitation} 
            />
          ))}
        </div>
      )}

      {/* Search input */}
      <div {...props(styles.inputContainer)}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type to search or create classifier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.trim() !== '' && setShowDropdown(true)}
          {...props(styles.input)}
        />
        
        {showDropdown && (
          <div ref={dropdownRef} {...props(styles.dropdown)}>
            {filteredClassifiers.length > 0 ? (
              <>
                {filteredClassifiers.map((classifier, index) => (
                  <div
                    key={classifier.id}
                    onClick={() => selectClassifier(classifier)}
                    {...props(
                      styles.dropdownItem,
                      selectedIndex === index && styles.selectedItem
                    )}
                  >
                    {highlightMatch(classifier.referredToAs)}
                    {classifier.aliases && classifier.aliases.length > 0 && (
                      <div {...props(styles.aliasesList)}>
                        Aliases: {classifier.aliases.map(a => highlightMatch(a)).map((a, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && ", "}{a}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div
                {...props(
                  styles.createNew,
                  selectedIndex === filteredClassifiers.length && styles.selectedItem
                )}
                onClick={createClassifier}
              >
                Create new classifier: "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && <div {...props(styles.errorMessage)}>{error}</div>}
    </div>
  );
};

export default ClassifyCitation;
