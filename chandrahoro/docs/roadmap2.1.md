# ChandraHoro V2.1 Implementation Roadmap
**10-Week Implementation Plan**

---

## Week-by-Week Breakdown

### **Week 1-2: Foundation & Database**

#### Tasks:
1. **Database Schema Migration**
   - Create Alembic migration scripts
   - Add new tables: `ai_entitlements`, `llm_profiles`, `audit_logs`, `quota_counters`, `daily_readings`
   - Test migrations in staging environment

2. **Redis Setup**
   - Configure Redis for rate limiting
   - Set up session storage
   - Create quota counter keys structure

3. **Admin Authentication**
   - Implement OTP email service
   - Add TOTP (Google Authenticator) support
   - Create JWT token generation/validation

#### Deliverables:
- ✅ All MySQL tables created and tested
- ✅ Redis operational with quota counters
- ✅ Admin can log in with OTP + TOTP

#### Code Example: Alembic Migration
```python
# alembic/versions/001_add_ai_entitlements.py
def upgrade():
    op.create_table(
        'ai_entitlements',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('enabled', sa.Boolean, default=True),
        sa.Column('requests_per_day', sa.Integer, default=10),
        sa.Column('tokens_per_day', sa.Integer, default=50000),
        sa.Column('allowed_models', sa.JSON),
        sa.Column('allowed_endpoints', sa.JSON),
        sa.Column('cap_mode', sa.Enum('soft', 'hard'), default='soft'),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
```

---

### **Week 3-4: Policy Engine & Rate Limiting**

#### Tasks:
1. **Policy Engine**
   - Build entitlement checker
   - Implement model validation
   - Add time-bound access checks

2. **Rate Limiter**
   - Redis-based sliding window
   - Soft vs hard cap logic
   - Quota reset at midnight (user TZ)

3. **Admin APIs**
   - `POST /admin/users/{id}/ai/entitlements`
   - `GET /admin/users/{id}/ai/entitlements`
   - `POST /admin/users/{id}/ai/reset-quota`

#### Deliverables:
- ✅ Policy engine validates entitlements
- ✅ Rate limiter enforces quotas
- ✅ Admin can set/view/reset entitlements

#### Code Example: Rate Limiter
```python
# app/core/rate_limiter.py
import redis
from datetime import date, datetime

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def consume_quota(user_id: str, endpoint: str, est_tokens: int):
    entitlement = get_entitlement(user_id)
    today = date.today().isoformat()
    
    req_key = f"quota:{user_id}:{today}:requests"
    tok_key = f"quota:{user_id}:{today}:tokens"
    
    current_requests = int(redis_client.get(req_key) or 0)
    current_tokens = int(redis_client.get(tok_key) or 0)
    
    # Check limits
    if current_requests >= entitlement.requests_per_day:
        if entitlement.cap_mode == "hard":
            return {"allowed": False, "reason": "limit_exceeded"}
        else:
            return {"allowed": True, "warning": True}
    
    # Consume
    redis_client.incr(req_key)
    redis_client.incrby(tok_key, est_tokens)
    redis_client.expire(req_key, 86400)
    redis_client.expire(tok_key, 86400)
    
    return {"allowed": True, "remaining": entitlement.requests_per_day - current_requests - 1}
```

---

### **Week 5-6: LLM Integration & RAG**

#### Tasks:
1. **LLM Router**
   - Multi-provider support (OpenAI, Anthropic, Google)
   - User-key vs platform-key routing
   - Fallback logic

2. **Key Vault**
   - HashiCorp Vault or AWS Secrets Manager
   - Write-only key storage
   - Key masking in responses

3. **RAG Setup**
   - Seed astrology knowledge base (5000+ interpretations)
   - Create embeddings (OpenAI `text-embedding-3-small`)
   - Store in pgvector or Pinecone

4. **Prompt Templates**
   - System prompts (safety, tone, language)
   - User prompts (daily reading, chat, compatibility)

#### Deliverables:
- ✅ LLM router can call OpenAI/Anthropic/Google
- ✅ User API keys stored securely in vault
- ✅ RAG retrieves relevant interpretations

#### Code Example: LLM Router
```python
# app/core/llm_router.py
import openai
import anthropic

def route_request(user_id: str, endpoint: str, prompt: str):
    llm_profile = get_llm_profile(user_id)
    
    if llm_profile and llm_profile.mode == "user-key":
        # Use user's API key
        api_key = vault.get_key(llm_profile.key_ref)
        provider = llm_profile.provider
        model = llm_profile.model
    else:
        # Use platform default
        provider = "anthropic"
        model = "claude-sonnet-3.5"
        api_key = os.getenv("ANTHROPIC_API_KEY")
    
    try:
        if provider == "anthropic":
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model=model,
                max_tokens=llm_profile.max_tokens if llm_profile else 1000,
                temperature=llm_profile.temperature if llm_profile else 0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            return {"text": response.content[0].text, "tokens": response.usage.total_tokens}
        
        elif provider == "openai":
            client = openai.OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=llm_profile.temperature if llm_profile else 0.7
            )
            return {"text": response.choices[0].message.content, "tokens": response.usage.total_tokens}
    
    except Exception as e:
        # Fallback to platform key
        logger.warning(f"User key failed for {user_id}: {e}")
        return route_request_platform_key(endpoint, prompt)
```

---

### **Week 7-8: Daily Readings & Chat**

#### Tasks:
1. **Daily Reading Generator**
   - Celery job (runs 5:00 AM IST daily)
   - Computes transits + natal chart overlay
   - Generates reading using LLM + RAG
   - Caches in `daily_readings` table

2. **AI Chat**
   - Conversational endpoint with history
   - Tool-enabled (chart calculation, yoga detection)
   - Maintains last 10 messages per conversation

3. **Notification Service**
   - Firebase Cloud Messaging setup
   - Smart timing (analyze user open patterns)
   - Bilingual support (English + Telugu)

#### Deliverables:
- ✅ Daily readings generated for all users by 6 AM
- ✅ AI chat functional with tool calls
- ✅ Push notifications sent at optimal time

#### Code Example: Daily Reading Celery Task
```python
# app/tasks/daily_readings.py
from celery import Celery
from datetime import date, datetime

celery_app = Celery('chandrahoro', broker='redis://localhost:6379/0')

@celery_app.task
def generate_daily_readings():
    today = date.today()
    active_users = get_active_users()
    
    for user in active_users:
        try:
            # Check if reading already exists (cache hit)
            existing = db.query(DailyReading).filter(
                DailyReading.user_id == user.id,
                DailyReading.date == today
            ).first()
            
            if existing:
                continue
            
            # Generate new reading
            profile = get_user_primary_profile(user.id)
            chart = compute_natal_chart(profile)
            transits = compute_transits(today, profile.location)
            
            # Build prompt
            prompt = f"""
            Generate a daily reading for {user.full_name} on {today}.
            
            Natal Chart: {chart}
            Current Transits: {transits}
            
            Provide:
            - 3-5 highlight bullets
            - Detailed segments for Work, Love, Health, Finance
            - Auspicious timings
            
            Tone: {user.tone_preference}
            Language: {user.locale}
            """
            
            # Add RAG context
            rag_context = search_astro_kb(f"transits {transits['sun']['sign']} {transits['moon']['sign']}")
            prompt += f"\n\nReference: {rag_context}"
            
            # Call LLM
            response = route_request(user.id, "reading.daily", prompt)
            
            # Parse response
            reading = parse_reading_response(response['text'])
            
            # Save to DB
            db_reading = DailyReading(
                user_id=user.id,
                profile_id=profile.id,
                date=today,
                reading_json=reading,
                highlights=reading['highlights'],
                model_used="claude-sonnet-3.5",
                tokens_used=response['tokens']
            )
            db.add(db_reading)
            db.commit()
            
            # Send notification
            if user.notifications_enabled:
                send_push_notification(user.id, "Your daily reading is ready ✨")
        
        except Exception as e:
            logger.error(f"Failed to generate reading for user {user.id}: {e}")

# Schedule: Run daily at 5:00 AM IST
celery_app.conf.beat_schedule = {
    'daily-readings': {
        'task': 'app.tasks.daily_readings.generate_daily_readings',
        'schedule': crontab(hour=5, minute=0)
    }
}
```

---

### **Week 9: Admin UI & Audit Logs**

#### Tasks:
1. **Admin Dashboard**
   - User list with search/filter
   - User detail view (profile, usage, entitlements)
   - Entitlement management form
   - LLM profile editor
   - Metrics dashboard (Grafana-style charts)

2. **Audit Logging**
   - Log all admin actions (create, update, delete)
   - Display diffs (before/after)
   - Export to CSV
   - Immutable (append-only)

3. **Frontend Integration**
   - User dashboard shows AI quota usage
   - Settings page for LLM profile configuration
   - Share buttons for daily readings

#### Deliverables:
- ✅ Admin UI fully functional
- ✅ All admin actions logged
- ✅ Users can see their quota usage

#### Code Example: Audit Logging Decorator
```python
# app/core/audit.py
from functools import wraps
import json

def audit_log(action: str, resource_type: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract actor from JWT
            actor = get_current_user()
            
            # Get "before" state if update/delete
            if action in ["UPDATE", "DELETE"]:
                target_id = kwargs.get('id') or args[0]
                before = get_resource_state(resource_type, target_id)
            else:
                before = None
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Get "after" state
            if action in ["CREATE", "UPDATE"]:
                after = result.dict() if hasattr(result, 'dict') else result
            else:
                after = None
            
            # Create audit log
            log = AuditLog(
                actor_id=actor.id,
                actor_role=actor.role,
                action=f"{resource_type.upper()}_{action}",
                target_user_id=kwargs.get('user_id'),
                resource_type=resource_type,
                resource_id=result.id if hasattr(result, 'id') else None,
                diff_before=before,
                diff_after=after,
                ip_address=get_request_ip(),
                user_agent=get_request_user_agent()
            )
            db.add(log)
            db.commit()
            
            return result
        return wrapper
    return decorator

# Usage:
@router.post("/admin/users/{user_id}/ai/entitlements")
@audit_log(action="UPDATE", resource_type="entitlement")
async def set_entitlements(user_id: str, entitlement: EntitlementUpdate):
    # Implementation
    pass
```

---

### **Week 10: Testing, Launch & Monitoring**

#### Tasks:
1. **Testing**
   - Unit tests (80% coverage)
   - Integration tests (API endpoints)
   - Load tests (10K users generating readings)
   - Security tests (SQL injection, XSS, brute force)

2. **Beta Launch**
   - Invite 100 beta users
   - Enable feature flags
   - Monitor error rates, latency, cost

3. **Monitoring Setup**
   - Grafana dashboards (AI usage, performance)
   - PagerDuty alerts (API errors, cost spikes)
   - Log aggregation (ELK stack or Datadog)

4. **Documentation**
   - User guide (how to use AI features)
   - Admin guide (managing entitlements)
   - API docs (Swagger/ReDoc)

#### Deliverables:
- ✅ All tests passing
- ✅ Beta launched with 100 users
- ✅ Monitoring dashboards operational
- ✅ Documentation complete

---

## Critical Success Factors

### **Technical**
✅ Daily readings delivered by 6 AM IST (99% reliability)  
✅ API latency p95 < 4s  
✅ Cache hit rate > 70%  
✅ Cost < $5000/month  

### **Product**
✅ D7 retention > 30%  
✅ AI chat satisfaction > 4.0/5  
✅ Share rate > 10%  
✅ Zero P0 bugs in production  

### **Business**
✅ 1000 new signups in first week  
✅ Positive user feedback (NPS > 40)  
✅ Press coverage (2+ tech blogs)  

---

## Risk Mitigation Checklist

| Risk | Mitigation | Status |
|------|------------|--------|
| LLM cost spike | Caching + quotas + alerts | ✅ Implemented |
| Model hallucinations | RAG + human QA + feedback loop | ✅ Implemented |
| User confusion | Tooltips + guided tours + docs | ⏳ In Progress |
| Key vault breach | Encryption + audits + rotation | ✅ Implemented |
| Provider outage | Multi-provider fallback + cache | ✅ Implemented |

---

## Post-Launch (V2.1)

### **Month 2: Payment Integration**
- Stripe/Razorpay integration
- Self-service plan upgrades
- Billing dashboard

### **Month 3: Advanced Features**
- Compatibility (full) with detailed reports
- Weekly/monthly reading summaries
- Export to PDF with branding

### **Month 4: Mobile Apps**
- iOS/Android native apps
- Push notifications
- Offline mode (cached readings)

---

## Team Structure

### **Week 1-2: Foundation**
- Backend Dev (2): Database + Auth
- DevOps (1): Redis + Vault setup

### **Week 3-6: Core AI**
- Backend Dev (2): Policy engine + LLM router
- AI/ML Engineer (1): RAG + prompt engineering

### **Week 7-8: Features**
- Backend Dev (2): Daily readings + chat
- Frontend Dev (2): User dashboard + settings

### **Week 9: Admin UI**
- Frontend Dev (2): Admin console
- Backend Dev (1): Audit logging

### **Week 10: Testing & Launch**
- QA Engineer (2): Testing
- DevOps (1): Monitoring
- Product Manager (1): Beta coordination

---

## Success Metrics Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                ChandraHoro V2 Metrics                    │
├─────────────────────────────────────────────────────────┤
│ Active Users: 1,234                                      │
│ Daily Readings Generated: 987 (80% rate)                │
│ AI Chat Messages: 456                                    │
│ Avg Tokens/User/Day: 15,234                             │
│ Cost Today: $123.45 (on track for $3,700/month)         │
│ API Latency p95: 3.2s ✅                                 │
│ Cache Hit Rate: 73% ✅                                   │
│ Error Rate: 0.02% ✅                                     │
│ D7 Retention: 34% ✅                                     │
└─────────────────────────────────────────────────────────┘
```

---

**End of Roadmap**