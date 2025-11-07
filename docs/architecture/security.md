# Journey | Security System

> Technical documentation for JWT authentication security, token rotation and replay attack detection

## Index

- [Overview](#overview)
- [Architecture](#architecture)
- [Token Rotation](#token-rotation)
- [Replay Attack Detection](#replay-attack-detection)
- [Token Blacklist](#token-blacklist)
- [Rate Limiting](#rate-limiting)
- [Security Monitoring](#security-monitoring)
- [API](#api)

---

## Overview

The **Security System** implements advanced JWT authentication with automatic token rotation, replay attack detection, and comprehensive security monitoring.

### Key Features

- **Automatic token rotation** on every refresh request
- **Replay attack detection** with full session revocation
- **Temporary token blacklist** using Redis with TTL
- **Distributed rate limiting** across authentication endpoints
- **Centralized security event monitoring**
- **Mass session revocation** for compromised accounts

### Security Goals

- Prevent unauthorized access through stolen refresh tokens
- Detect and mitigate replay attacks in real-time
- Provide audit trail for security events
- Implement defense-in-depth authentication strategy

---

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────┐
│            Presentation Layer                    │
│  • AuthController                               │
│  • AuthRoutes (with rate limiting)              │
│  • AuthMiddleware (blacklist check)             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           Application Layer                      │
│  • RefreshTokenUseCase                          │
│  • LogoutUseCase                                │
│  • LoginUseCase                                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Domain Layer                        │
│  • Session (Entity)                             │
│  • JWTService                                   │
│  • IAuthRepository (Interface)                  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Infrastructure Layer                    │
│  • AuthRepository (Redis sessions)              │
│  • MonitoringService (security events)          │
│  • RateLimitPlugin (Fastify)                    │
└─────────────────────────────────────────────────┘
```

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **RefreshTokenUseCase** | `application/use-cases/` | Token rotation and reuse detection |
| **AuthRepository** | `infrastructure/repositories/` | Session management and token blacklist |
| **AuthMiddleware** | `infrastructure/middleware/` | JWT validation and blacklist verification |
| **MonitoringService** | `infrastructure/services/` | Security event logging and alerts |
| **Rate Limiting** | `server.ts` + routes | Brute-force protection |

---

## Token Rotation

### How It Works

Every refresh request generates new access and refresh tokens, immediately invalidating the previous refresh token.

```typescript
// Simplified flow
1. Client sends refresh token R1
2. Server validates R1 and finds associated session
3. Server generates new tokens (access A2, refresh R2)
4. Server deletes old session for R1
5. Server adds R1 to blacklist with TTL
6. Server creates new session for R2
7. Client receives A2 and R2
```

### Implementation

**Location:** `src/modules/auth/application/use-cases/refresh-token.use-case.ts`

```typescript
class RefreshTokenUseCase {
  async execute(refreshToken: string, metadata?: SecurityMetadata) {
    const session = await this.authRepository.findSessionByToken(refreshToken);

    if (!session) {
      // Token reuse detected - see Replay Attack Detection section
      await this.handleTokenReuse(refreshToken, metadata);
    }

    // Verify token hasn't expired
    const decoded = await this.jwtService.verifyToken(refreshToken);

    // Generate new tokens with rotation
    const newTokens = await this.jwtService.generateTokenPair({
      sub: session.userId,
      email: session.user.email,
      role: session.user.role
    });

    // Delete old session
    await this.authRepository.deleteSession(session.id);

    // Blacklist old refresh token
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0 && decoded.jti) {
      await this.authRepository.blacklistToken(decoded.jti, ttl);
    }

    // Create new session
    await this.authRepository.createSession({
      userId: session.userId,
      refreshToken: newTokens.refreshToken,
      ...metadata
    });

    return newTokens;
  }
}
```

### Benefits

- **Short-lived tokens:** Reduces window of opportunity for attackers
- **Automatic rotation:** No manual intervention required
- **Immediate invalidation:** Old tokens cannot be reused
- **TTL-based blacklist:** Automatic cleanup, no memory leaks

---

## Replay Attack Detection

### Attack Scenario

```
Timeline:
1. User logs in → Receives refresh token R1
2. Attacker intercepts R1 (network sniffing, XSS, etc)
3. User legitimately uses R1 → R1 invalidated, receives R2
4. Attacker attempts to use stolen R1

Detection:
- R1 is valid JWT (signature correct, not expired)
- BUT session for R1 no longer exists in Redis
- This indicates token reuse → REPLAY ATTACK
```

### Detection Logic

**Location:** `src/modules/auth/application/use-cases/refresh-token.use-case.ts`

```typescript
async handleTokenReuse(token: string, metadata: SecurityMetadata) {
  // Verify token is still valid JWT
  let decoded;
  try {
    decoded = await this.jwtService.verifyToken(token);
  } catch {
    // Token is invalid/expired, just throw normal error
    throw new TokenInvalidError();
  }

  // Token is valid but session doesn't exist = REUSE DETECTED
  logger.error({
    event: 'REFRESH_TOKEN_REUSE_DETECTED',
    userId: decoded.sub,
    ipAddress: metadata?.ipAddress,
    message: 'Possible replay attack detected'
  }, 'SECURITY ALERT: Token reuse detected');

  // Log security event
  this.monitoringService.logSecurityEvent({
    type: 'TOKEN_REUSE',
    userId: decoded.sub,
    severity: 'CRITICAL',
    details: {
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      timestamp: new Date()
    }
  });

  // Revoke ALL user sessions immediately
  await this.authRepository.deleteUserSessions(decoded.sub);

  throw new TokenInvalidError(
    'Token reuse detected. All sessions have been revoked for security.'
  );
}
```

### Response to Attack

1. **Log critical security event** with full context
2. **Revoke all user sessions** to lock out attacker
3. **Force user to re-authenticate** on all devices
4. **Return error to client** without revealing detection method

---

## Token Blacklist

### Redis Structure

```
Key Pattern: bl:${jti}
Value: "1"
TTL: Time remaining until JWT expiration
```

### When Tokens Are Blacklisted

| Scenario | Token Type | Reason |
|----------|-----------|--------|
| **Token Refresh** | Old refresh token | Prevent reuse after rotation |
| **Logout** | Refresh token | Invalidate session immediately |
| **Admin Revocation** | Any token | Manual security action |

### Repository Implementation

**Location:** `src/modules/auth/infrastructure/repositories/auth.repository.ts`

```typescript
class AuthRepository implements IAuthRepository {
  async blacklistToken(jti: string, ttl: number): Promise<void> {
    const key = `bl:${jti}`;
    await this.redis.setex(key, ttl, '1');

    logger.info({
      operation: 'blacklist_token',
      jti,
      ttlSeconds: ttl
    }, 'Token added to blacklist');
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const key = `bl:${jti}`;
    const exists = await this.redis.exists(key);
    return exists === 1;
  }
}
```

### Middleware Verification

**Location:** `src/modules/auth/infrastructure/middleware/auth.middleware.ts`

```typescript
class AuthMiddleware {
  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    const token = extractToken(request);
    const payload = await this.jwtService.verifyToken(token);

    // Check if token is blacklisted
    if (payload.jti) {
      const isBlacklisted = await this.authRepository.isTokenBlacklisted(
        payload.jti
      );

      if (isBlacklisted) {
        throw new TokenInvalidError('Token has been revoked');
      }
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}
```

### Automatic Cleanup

- **TTL-based expiration:** Tokens automatically removed when JWT expires
- **No manual cleanup:** Redis handles memory management
- **Memory efficient:** Only active tokens in blacklist
- **O(1) operations:** EXISTS and SETEX are constant time

---

## Rate Limiting

### Global Configuration

**Location:** `src/server.ts`

```typescript
await app.register(rateLimit, {
  global: false,
  max: 300,                    // requests
  timeWindow: '1 minute',      // window
  redis: redis,                // distributed via Redis
  keyGenerator: (request) => {
    const user = request.user as { id?: string } | undefined;
    return user?.id || request.ip;
  }
});
```

### Endpoint-Specific Limits

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| **POST /auth/register** | 3 | 15 min | Prevent account spam |
| **POST /auth/login** | 5 | 5 min | Brute-force protection |
| **POST /auth/refresh** | 10 | 1 min | Allow normal usage |
| **POST /auth/forgot-password** | 3 | 15 min | Prevent email spam |

### Error Response

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again in 45 seconds.",
  "retryAfter": 45,
  "statusCode": 429
}
```

**Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 45
```

---

## Security Monitoring

### MonitoringService

**Location:** `src/modules/auth/infrastructure/services/monitoring.service.ts`

```typescript
interface SecurityEvent {
  type: 'TOKEN_REUSE' | 'RATE_LIMIT' | 'SUSPICIOUS_IP' | 'BLACKLIST_HIT';
  userId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, any>;
  timestamp: Date;
}

class MonitoringService {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent = { ...event, timestamp: new Date() };

    this.events.push(fullEvent);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    logger.warn({
      alert: 'SECURITY_EVENT',
      ...event
    }, `Security event: ${event.type}`);

    if (event.severity === 'CRITICAL') {
      this.sendCriticalAlert(fullEvent);
    }
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByUser(userId: string, limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .slice(-limit);
  }
}
```

### Event Types

| Event | Severity | Trigger |
|-------|----------|---------|
| **TOKEN_REUSE** | CRITICAL | Valid token used after invalidation |
| **RATE_LIMIT** | MEDIUM | User exceeds request limit |
| **BLACKLIST_HIT** | HIGH | Attempt to use revoked token |
| **SUSPICIOUS_IP** | MEDIUM | Multiple IPs for same user |
| **MULTIPLE_DEVICES** | LOW | Login from new device |

### Usage Example

```typescript
// In RefreshTokenUseCase
this.monitoringService.logSecurityEvent({
  type: 'TOKEN_REUSE',
  userId: decoded.sub,
  severity: 'CRITICAL',
  details: {
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
    attemptedToken: maskToken(refreshToken)
  }
});

// Query events
const criticalEvents = monitoringService.getEventsBySeverity('CRITICAL');
const userEvents = monitoringService.getEventsByUser(userId);
```

---

## API

### Repository Interface

**Location:** `src/modules/auth/domain/repositories/auth.repository.interface.ts`

```typescript
export interface IAuthRepository {
  // Session management
  createSession(data: CreateSessionData): Promise<Session>;
  findSessionByToken(token: string): Promise<Session | null>;
  findSessionsByUserId(userId: string): Promise<Session[]>;
  deleteSession(sessionId: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  updateSessionActivity(sessionId: string): Promise<void>;

  // Token blacklist
  blacklistToken(jti: string, ttl: number): Promise<void>;
  isTokenBlacklisted(jti: string): Promise<boolean>;
}
```

### Use Case Interfaces

```typescript
// RefreshTokenUseCase
interface RefreshTokenInput {
  refreshToken: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// LogoutUseCase
interface LogoutInput {
  refreshToken: string;
}
```

### HTTP Endpoints

```typescript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

---

## Performance Metrics

### Expected Overhead

| Operation | Additional Time | Complexity |
|-----------|----------------|-----------|
| **Blacklist Check** | +2-5ms | O(1) Redis EXISTS |
| **Blacklist Creation** | +2-5ms | O(1) Redis SETEX |
| **Token Reuse Detection** | +10-20ms | Session lookup + revocation |
| **Rate Limiting** | +1-3ms | O(1) Redis INCR |

### Redis Memory Usage

```
Blacklist:
- Size per token: ~50 bytes
- Average TTL: 15 minutes
- Auto-expiration: Yes

Rate Limiting:
- Size per user: ~30 bytes
- TTL: 1-15 minutes
- Auto-cleanup: Yes

Sessions:
- Size per session: ~200 bytes
- TTL: 7 days
- Auto-expiration: Yes
```

---

## Testing

### Token Rotation Test

```bash
# 1. Login and save cookies
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# 2. First refresh
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies2.txt

# 3. Try to use old token
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt

# Expected: 401 Unauthorized
```

### Replay Attack Detection Test

```bash
# 1. Login and extract refresh token
TOKEN_R1=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.data.refreshToken')

# 2. Use refresh token (R1 → R2)
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=$TOKEN_R1"

# 3. Attempt to reuse R1
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=$TOKEN_R1"

# Expected:
# - 401 "Token reuse detected"
# - All user sessions revoked
# - CRITICAL event logged
```

### Rate Limiting Test

```bash
# Make 6 rapid login attempts
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"wrong"}' \
    -w "\nHTTP: %{http_code}\n\n"
done

# Expected:
# - Attempts 1-5: 401 Unauthorized
# - Attempt 6: 429 Rate Limit Exceeded
```

---

## Future Enhancements

### Planned Features

1. **Security Dashboard**
   - Admin panel for security event visualization
   - Real-time alerts and notifications
   - Threat intelligence integration

2. **Geolocation Tracking**
   - Detect logins from suspicious countries
   - Alert users about new device locations
   - Geo-based risk scoring

3. **Two-Factor Authentication**
   - TOTP authenticator support
   - SMS/Email backup codes
   - Recovery key generation

4. **Device Fingerprinting**
   - Unique device identification
   - New device alerts
   - Trusted device management

5. **Anomaly Detection**
   - Machine learning for unusual patterns
   - Behavioral analysis
   - Predictive risk scoring

---

## References

- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [Fastify Rate Limit](https://github.com/fastify/fastify-rate-limit)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
