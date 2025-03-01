# Citation Classification Components

This folder contains the components used for classifying citations.

## ClassifyCitation Component

The `ClassifyCitation` component provides an autocomplete interface for classifying citations. It allows users to:

1. Search for existing classifiers by name or aliases
2. Select an existing classifier to apply to a citation
3. Create a new classifier if needed
4. View applied classifiers as tags/badges

### Features

- **Autocomplete Search**: As users type, the component searches both classifier names and aliases
- **Keyboard Navigation**: Arrow keys to navigate results, Enter to select
- **Highlighting**: Search matches are highlighted for easy identification
- **Create New**: If no match is found, users can create a new classifier with the entered text
- **Applied Badges**: Shows badges for classifiers already applied to the citation
- **API Integration**: Connects to the classifier service API (running at port 8081)

### Usage

The component is integrated into the `CitationLine` component and appears below the citation content:

```tsx
<CitationLine citation={citation} />
```

### Props

The `ClassifyCitation` component accepts these props:

- `citation`: The citation object to be classified
- `onClassifierAdded` (optional): Callback function when a classifier is successfully added

### API Integration

The component communicates with these API endpoints:

- `GET /classifiers`: Fetches all available classifiers
- `POST /classifiers`: Creates a new classifier
- `POST /classifiers/:id/citations/:citationId`: Links a classifier to a citation

## Integration with CitationLine

The `ClassifyCitation` component is embedded in the `CitationLine` component, allowing users to classify citations directly from the citation display. 