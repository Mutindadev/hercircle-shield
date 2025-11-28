# HerCircle Shield API Documentation

## Overview

HerCircle Shield uses **tRPC** for type-safe API communication between the frontend and backend. All endpoints are accessible via `/api/trpc` and support automatic TypeScript type inference.

## Base URL

```
Development: http://localhost:3000/api/trpc
Production: https://your-domain.com/api/trpc
```

## Authentication

All protected endpoints require authentication via Manus OAuth. The session token is stored in an HTTP-only cookie and automatically included in requests.

## API Endpoints

### Authentication

#### `auth.me`
**Type:** Query  
**Auth:** Public  
**Description:** Get current authenticated user information

**Response:**
```typescript
{
  id: number;
  openId: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
```

#### `auth.logout`
**Type:** Mutation  
**Auth:** Public  
**Description:** Logout current user and clear session

**Response:**
```typescript
{
  success: boolean;
}
```

---

### Incidents

#### `incidents.create`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Create a new incident report

**Input:**
```typescript
{
  title: string;
  description: string;
  platform: string;
  incidentType: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  evidenceUrls?: string;
  contentHash?: string;
  location?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  id: number;
}
```

#### `incidents.list`
**Type:** Query  
**Auth:** Protected  
**Description:** Get all incidents for current user

**Response:**
```typescript
Array<{
  id: number;
  title: string;
  description: string;
  platform: string;
  incidentType: string;
  severity: string;
  status: string;
  createdAt: Date;
}>
```

#### `incidents.get`
**Type:** Query  
**Auth:** Protected  
**Description:** Get specific incident by ID

**Input:**
```typescript
{
  id: number;
}
```

**Response:**
```typescript
{
  id: number;
  userId: number;
  title: string;
  description: string;
  platform: string;
  incidentType: string;
  severity: string;
  status: string;
  evidenceUrls: string;
  contentHash: string;
  location: string;
  metadata: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Trusted Contacts

#### `contacts.add`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Add a trusted contact

**Input:**
```typescript
{
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  relationship?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

#### `contacts.list`
**Type:** Query  
**Auth:** Protected  
**Description:** Get all trusted contacts for current user

**Response:**
```typescript
Array<{
  id: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  relationship: string;
  createdAt: Date;
}>
```

#### `contacts.delete`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Remove a trusted contact

**Input:**
```typescript
{
  id: number;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

### Support Circles

#### `circles.create`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Create a new support circle

**Input:**
```typescript
{
  circleName: string;
  circleType: string;
  description?: string;
  maxMembers?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  id: number;
}
```

#### `circles.list`
**Type:** Query  
**Auth:** Protected  
**Description:** Get all circles for current user

**Response:**
```typescript
Array<{
  id: number;
  circleName: string;
  circleType: string;
  description: string;
  maxMembers: number;
  createdAt: Date;
}>
```

#### `circles.addMember`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Add a member to a circle

**Input:**
```typescript
{
  circleId: number;
  userId: number;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

### Chat Messages

#### `chat.send`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Send a message to a circle

**Input:**
```typescript
{
  circleId: number;
  content: string;
  isEncrypted?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  id: number;
}
```

#### `chat.getMessages`
**Type:** Query  
**Auth:** Protected  
**Description:** Get messages for a circle

**Input:**
```typescript
{
  circleId: number;
  limit?: number;
}
```

**Response:**
```typescript
Array<{
  id: number;
  circleId: number;
  userId: number;
  content: string;
  isEncrypted: number;
  createdAt: Date;
}>
```

---

### AI Detection

#### `ai.detect`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Analyze content for harmful patterns

**Input:**
```typescript
{
  content: string;
}
```

**Response:**
```typescript
{
  isHarmful: boolean;
  detectionType: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  explanation: string;
  aiModel: 'gemini' | 'openai' | 'offline';
}
```

#### `ai.detectBatch`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Analyze multiple content items

**Input:**
```typescript
{
  contents: string[];
}
```

**Response:**
```typescript
Array<{
  isHarmful: boolean;
  detectionType: string[];
  severity: string;
  confidence: number;
  explanation: string;
  aiModel: string;
}>
```

---

### Detection Logs

#### `detection.log`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Log a detection event

**Input:**
```typescript
{
  platform: string;
  detectionType: string;
  severity: string;
  content?: string;
  aiModel?: string;
  confidence?: number;
  wasBlocked?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

#### `detection.stats`
**Type:** Query  
**Auth:** Protected  
**Description:** Get detection statistics

**Input:**
```typescript
{
  days?: number;
}
```

**Response:**
```typescript
Array<{
  date: string;
  count: number;
  platform: string;
  detectionType: string;
}>
```

---

### NCII Takedown

#### `takedown.create`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Submit NCII takedown request

**Input:**
```typescript
{
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'telegram';
  contentUrl: string;
  contentHash?: string;
  description: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  requestId: string;
  message: string;
  estimatedResponseTime: string;
}
```

#### `takedown.list`
**Type:** Query  
**Auth:** Protected  
**Description:** Get all takedown requests for current user

**Response:**
```typescript
Array<{
  id: number;
  platform: string;
  contentUrl: string;
  status: string;
  requestId: string;
  createdAt: Date;
}>
```

---

### Legal Cases

#### `legal.create`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Create a legal case

**Input:**
```typescript
{
  caseType: string;
  description: string;
  country: string;
  status?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  id: number;
}
```

#### `legal.list`
**Type:** Query  
**Auth:** Protected  
**Description:** Get all legal cases for current user

**Response:**
```typescript
Array<{
  id: number;
  caseType: string;
  description: string;
  country: string;
  status: string;
  createdAt: Date;
}>
```

---

### User Settings

#### `settings.get`
**Type:** Query  
**Auth:** Protected  
**Description:** Get user settings

**Response:**
```typescript
{
  id: number;
  sensitivity: 'low' | 'balanced' | 'high';
  autoHide: number;
  enableNotifications: number;
  enableGPS: number;
  enableHeartAnimations: number;
  language: string;
}
```

#### `settings.update`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Update user settings

**Input:**
```typescript
{
  sensitivity?: 'low' | 'balanced' | 'high';
  autoHide?: number;
  enableNotifications?: number;
  enableGPS?: number;
  enableHeartAnimations?: number;
  language?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

### Peer Matching

#### `matching.request`
**Type:** Mutation  
**Auth:** Protected  
**Description:** Request peer matching

**Input:**
```typescript
{
  supportType: string;
  preferences?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  matchId?: number;
}
```

#### `matching.status`
**Type:** Query  
**Auth:** Protected  
**Description:** Get matching request status

**Input:**
```typescript
{
  matchId: number;
}
```

**Response:**
```typescript
{
  status: 'pending' | 'matched' | 'expired';
  matchedUserId?: number;
  circleId?: number;
}
```

---

## WebSocket Events

### Connection

```javascript
const socket = io('https://your-domain.com', {
  path: '/api/socket.io'
});
```

### Events

#### `join_circle`
**Direction:** Client → Server  
**Payload:**
```typescript
{
  userId: number;
  circleId: number;
  userName: string;
}
```

#### `send_message`
**Direction:** Client → Server  
**Payload:**
```typescript
{
  circleId: number;
  userId: number;
  content: string;
  userName: string;
  isEncrypted?: number;
}
```

#### `new_message`
**Direction:** Server → Client  
**Payload:**
```typescript
{
  circleId: number;
  userId: number;
  userName: string;
  content: string;
  timestamp: number;
}
```

#### `typing`
**Direction:** Client → Server  
**Payload:**
```typescript
{
  circleId: number;
  userName: string;
  isTyping: boolean;
}
```

#### `user_typing`
**Direction:** Server → Client  
**Payload:**
```typescript
{
  userName: string;
  isTyping: boolean;
}
```

#### `panic_alert`
**Direction:** Client → Server  
**Payload:**
```typescript
{
  userId: number;
  userName: string;
  location?: any;
}
```

#### `panic_alert_received`
**Direction:** Server → Client  
**Payload:**
```typescript
{
  userId: number;
  userName: string;
  location?: any;
  timestamp: number;
}
```

---

## Error Handling

All tRPC endpoints return standardized errors:

```typescript
{
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR';
  message: string;
}
```

### Common Error Codes

- **UNAUTHORIZED**: User not authenticated
- **FORBIDDEN**: User lacks permission
- **NOT_FOUND**: Resource not found
- **BAD_REQUEST**: Invalid input data
- **INTERNAL_SERVER_ERROR**: Server error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Detection endpoints**: 100 requests per minute
- **Chat endpoints**: 60 messages per minute
- **Other endpoints**: 300 requests per minute

---

## Examples

### JavaScript/TypeScript (Frontend)

```typescript
import { trpc } from '@/lib/trpc';

// Create incident
const result = await trpc.incidents.create.mutate({
  title: 'Harassment on Twitter',
  description: 'Received threatening messages',
  platform: 'Twitter',
  incidentType: 'harassment',
  severity: 'high'
});

// Get incidents
const incidents = await trpc.incidents.list.useQuery();

// Detect content
const detection = await trpc.ai.detect.mutate({
  content: 'Suspicious message content'
});
```

### cURL

```bash
# Note: tRPC uses batched requests, direct cURL is not recommended
# Use the tRPC client instead
```

---

## Support

For API support, please contact:
- Email: api-support@hercircle.org
- GitHub Issues: https://github.com/hercircle/shield/issues
