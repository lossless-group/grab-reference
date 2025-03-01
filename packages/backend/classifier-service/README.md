# Classifier Service

This service provides CRUD operations for managing classifiers in the citation management system.

## API Endpoints

### Base URL: http://localhost:8081

### Classifiers

- `GET /classifiers` - Get all classifiers
- `GET /classifiers/:id` - Get a specific classifier by ID
- `POST /classifiers` - Create a new classifier
- `PUT /classifiers/:id` - Update an existing classifier
- `DELETE /classifiers/:id` - Delete a classifier

### Classifier Relationships

- `POST /classifiers/:id/citations/:citationId` - Associate a classifier with a citation
- `POST /classifiers/:id/children/:childId` - Create a parent-child relationship between classifiers

## Request/Response Examples

### Create a Classifier

**Request:**
```http
POST /classifiers
Content-Type: application/json

{
  "referredToAs": "Machine Learning",
  "aliases": ["ML", "Deep Learning", "Neural Networks"]
}
```

**Response:**
```json
{
  "id": 1,
  "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "createdAt": "2023-01-15T12:34:56.789Z",
  "updatedAt": "2023-01-15T12:34:56.789Z",
  "referredToAs": "Machine Learning",
  "aliases": ["ML", "Deep Learning", "Neural Networks"]
}
```

### Get All Classifiers

**Request:**
```http
GET /classifiers
```

**Response:**
```json
[
  {
    "id": 1,
    "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "createdAt": "2023-01-15T12:34:56.789Z",
    "updatedAt": "2023-01-15T12:34:56.789Z",
    "referredToAs": "Machine Learning",
    "aliases": ["ML", "Deep Learning", "Neural Networks"],
    "citations": [],
    "sources": [],
    "authors": [],
    "parentClassifiers": [],
    "childClassifiers": []
  }
]
```

## Development

### Running the Service

The service can be run as part of the Docker Compose setup:

```bash
docker-compose up classifier-service
```

### Building the Service

```bash
docker-compose build classifier-service
```

### Accessing the Service

The service runs on port 8081:

```
http://localhost:8081
``` 