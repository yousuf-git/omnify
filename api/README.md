# Inventory Management System - Backend API

## Environment Variables Required

```env
# Database
MONGO_URI=your_mongodb_connection_string

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name_here

# Server
PORT=3000
```

## Image Management Routes

### Upload Operations
```
POST   /api/images/upload-url           # Get pre-signed URL for single image upload
POST   /api/images/batch-upload-urls    # Get pre-signed URLs for multiple images
```

**Single Upload URL Example:**
```json
POST /api/images/upload-url
Content-Type: application/json

{
  "fileName": "image.<extension>",
  "contentType": "image/jpeg"
}

Response:
{
  "success": true,
  "uploadUrl": "https://bucket.s3.amazonaws.com/...",
  "key": "images/yyyy-mm-dd hh:mm:ss:ms.<extension>",
  "message": "Upload URL generated successfully"
}
```

**Batch Upload URLs Example:**
```json
POST /api/images/batch-upload-urls
Content-Type: application/json

{
  "files": [
    { "fileName": "image1.<extension>", "contentType": "image/jpeg" },
    { "fileName": "image2.png", "contentType": "image/png" }
  ]
}
```

### Download/View Operations
```
GET    /api/images/download-url?key=    # Get pre-signed URL for single image download
POST   /api/images/download-urls        # Get download URLs for multiple images  
GET    /api/images/public-url?key=      # Get public URL (if bucket allows)
```

**Single Download URL Example:**
```
GET /api/images/download-url?key=images/yyyy-mm-dd hh:mm:ss:ms.<extension>

Response:
{
  "success": true,
  "downloadUrl": "https://bucket.s3.amazonaws.com/...",
  "key": "images/yyyy-mm-dd hh:mm:ss:ms.<extension>",
  "message": "Download URL generated successfully"
}
```

**Multiple Download URLs Example:**
```json
GET /api/images/download-urls
Content-Type: application/json

{
  "keys": [
    "images/yyyy-mm-dd hh:mm:ss:ms1.<extension>",
    "images/yyyy-mm-dd hh:mm:ss:ms2.png"
  ]
}

Response:
{
  "success": true,
  "results": [
    { "key": "images/...", "downloadUrl": "https://...", "success": true },
    { "key": "images/...", "downloadUrl": "https://...", "success": true }
  ]
}
```

### Delete Operations
```
GET    /api/images/delete-url?key=      # Get pre-signed URL for deletion
DELETE /api/images/delete?key=          # Direct server-side deletion
DELETE /api/images                      # Bulk delete multiple images
```

**Single Delete Examples:**
```
GET /api/images/delete-url?key=images/yyyy-mm-dd hh:mm:ss:ms.<extension>
DELETE /api/images/delete?key=images/yyyy-mm-dd hh:mm:ss:ms.<extension>
```

**Bulk Delete Example:**
```json
DELETE /api/images
Content-Type: application/json

{
  "keys": [
    "images/yyyy-mm-dd hh:mm:ss:ms1.<extension>",
    "images/yyyy-mm-dd hh:mm:ss:ms2.png"
  ]
}
```

### Supported Image Types
- image/jpeg
- image/jpg  
- image/png
- image/gif
- image/webp

### Usage Flow for Frontend

1. **Get Upload URL**: Call `/api/images/upload-url` with filename
2. **Upload to S3**: Use returned pre-signed URL to upload directly to S3
3. **Store Key**: Save the returned S3 key in your database record
4. **Retrieve Images**: Use `/api/images/download-url?key=<s3-key>` or `/api/images/download-urls` with stored keys to get viewable URLs

## Ticket System Routes

### Ticket Management
```
GET    /api/ticket                      # Get all tickets
GET    /api/ticket/:id                  # Get ticket by ID
GET    /api/ticket/type/:type           # Get tickets by type (INSTALLATION/SUPPORT)
POST   /api/ticket                      # Create new ticket
PUT    /api/ticket/:id                  # Update ticket
PUT    /api/ticket/:id/resolution       # Update ticket resolution
DELETE /api/ticket/:id                  # Delete ticket
```

**Create Ticket Example:**
```json
POST /api/ticket
Content-Type: application/json

{
  "ticketType": "INSTALLATION",
  "ticketStatusId": "objectId",
  "issueTypeId": "objectId", 
  "stockItemId": "objectId",
  "storeId": "objectId",
  "pictures": [
    "images/yyyy-mm-dd hh:mm:ss:ms1.<extension>",
    "images/yyyy-mm-dd hh:mm:ss:ms2.png"
  ],
  "openingDate": "2025-09-02T10:00:00Z"
}
```

### Supporting Models
```
GET/POST/PUT/DELETE /api/ticket-status      # Ticket status management
GET/POST/PUT/DELETE /api/resolution-status  # Resolution status management
GET/POST/PUT/DELETE /api/issue-type         # Issue type management
GET/POST/PUT/DELETE /api/agency             # Agency management
GET/POST/PUT/DELETE /api/support-person     # Support person management
```

## Inventory Management Routes

### Stock Operations
```
GET/POST/PUT/DELETE /api/stock-in           # Stock in operations
GET/POST/PUT/DELETE /api/stock-out          # Stock out operations
GET/POST/PUT/DELETE /api/item-stock-records # Item stock records
```

### Items & Categories
```
GET/POST/PUT/DELETE /api/items              # Item management
GET/POST/PUT/DELETE /api/item-groups        # Item group management
GET/POST/PUT/DELETE /api/stock-items        # Stock item management
```

### Logistics & Delivery
```
GET/POST/PUT/DELETE /api/delivery-status            # Delivery status
GET/POST/PUT/DELETE /api/installation-status        # Installation status
GET/POST/PUT/DELETE /api/logistics-provider-categories # Logistics providers
```

### Organizations
```
GET/POST/PUT/DELETE /api/parties            # Party management
GET/POST/PUT/DELETE /api/stores             # Store management
GET/POST/PUT/DELETE /api/warehouses         # Warehouse management
GET/POST/PUT/DELETE /api/resellers          # Reseller management
```

## Error Handling

All routes return standardized error responses:

```json
{
  "message": "Error description",
  "errors": ["Detailed error messages if validation fails"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limits & Constraints

- **Image Upload**: Max 20 files per batch request
- **Image Download**: Max 50 keys per batch request  
- **Image Delete**: Max 50 keys per batch request
- **Pre-signed URL Expiry**: 1 hour (3600 seconds)
- **Max Image Size**: Depends on S3 bucket configuration
