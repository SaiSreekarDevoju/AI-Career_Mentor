"""Curated interview question bank: >=24 questions per interview type, by difficulty."""

from __future__ import annotations

import random

INTERVIEW_TYPES = [
    "Behavioral & Culture Fit",
    "System Design",
    "Frontend Technical",
    "Backend Technical",
    "Full Stack",
    "HR Screening",
    "AI/ML",
    "Data Structures & Algorithms",
    "Database Systems",
    "Cloud & DevOps",
    "OOPs",
    "Operating Systems",
    "Cybersecurity",
    "Mobile Development",
]


def _q(text: str, difficulty: str, hints: list[str], ideal: list[str]) -> dict:
    return {
        "question": text,
        "difficulty": difficulty,
        "hints": hints,
        "ideal_answer_key_points": ideal,
    }


def _behavioral_bank() -> list[dict]:
    out: list[dict] = []
    seeds_easy = [
        "Tell me about yourself and what you are looking for next in your career.",
        "Describe a time you received tough feedback. What did you change afterward?",
        "Share an example of collaborating with a difficult teammate. What was the outcome?",
        "When priorities shifted suddenly, how did you communicate with stakeholders?",
        "Describe a mistake you made at work and how you recovered trust.",
        "Give an example of going above and beyond for a customer or user.",
        "Tell me about a goal you set and how you measured progress.",
        "Describe how you handle disagreements in technical discussions.",
    ]
    seeds_med = [
        "Tell me about a conflict between engineering and product. How did you resolve it?",
        "Describe a project that failed or missed deadlines. What did you learn?",
        "Give an example of influencing a team without authority.",
        "Walk me through a time you improved team process or velocity.",
        "Describe a situation where you had ethical concerns. What did you do?",
        "Tell me about mentoring or onboarding someone successfully.",
        "Share a time you had to deliver bad news to leadership. How did you frame it?",
        "Describe a cross-functional initiative you led end-to-end.",
    ]
    seeds_hard = [
        "Describe a culture mismatch you observed. How did you adapt while staying effective?",
        "Tell me about a time values conflicted with business pressure. What trade-offs did you make?",
        "Walk me through rebuilding trust after a serious incident on your team.",
        "Describe handling a toxic pattern in meetings or communication. What changed?",
        "Give an example where you challenged leadership and were proven right—or wrong.",
        "Tell me about scaling culture as the team grew rapidly.",
        "Describe navigating ambiguity for months. How did you create clarity?",
        "Share a story where you had to let someone go or restructure responsibilities.",
    ]
    for s in seeds_easy:
        out.append(_q(s, "Easy", ["Use STAR", "Be specific"], ["Situation", "Task", "Action", "Result"]))
    for s in seeds_med:
        out.append(_q(s, "Medium", ["Name stakeholders", "Quantify impact"], ["Context", "Approach", "Outcome", "Learning"]))
    for s in seeds_hard:
        out.append(_q(s, "Hard", ["Show judgment", "Discuss trade-offs"], ["Stakeholders", "Principles", "Decisions", "Follow-up"]))
    return out


def _system_design_bank() -> list[dict]:
    out: list[dict] = []
    easy = [
        "Design a URL shortener for internal teams (low QPS). List core components.",
        "Design a basic rate limiter for a single server API.",
        "Sketch a simple notification system for a mobile app.",
        "Design a read-heavy cache for a product catalog.",
        "Outline a file upload service with virus scanning hook.",
        "Design a leaderboard for a game with hourly resets.",
        "Describe how you would add full-text search to an existing SQL app.",
        "Design a basic job queue for background emails.",
    ]
    med = [
        "Design a chat application supporting 1M DAU with delivery receipts.",
        "Design a ride matching system for a city with surge pricing.",
        "Design a collaborative document editor (operational transformation high level).",
        "Design a video streaming platform’s metadata and playback APIs.",
        "Design a distributed configuration service with strong consistency needs.",
        "Design a multi-tenant SaaS billing pipeline.",
        "Design a real-time analytics pipeline for clickstream events.",
        "Design a global CDN invalidation strategy for dynamic HTML fragments.",
    ]
    hard = [
        "Design Twitter timeline at scale including fan-out vs pull trade-offs.",
        "Design Uber dispatch with matching, ETA, and surge—discuss CAP implications.",
        "Design Google Drive including versioning, sharing, and offline sync.",
        "Design a distributed SQL database control plane (sharding, failover).",
        "Design YouTube transcoding and adaptive bitrate delivery worldwide.",
        "Design WhatsApp messaging with E2E encryption and group limits.",
        "Design a stock exchange matching engine with fairness and latency SLAs.",
        "Design a planet-scale metrics system with cardinality control.",
    ]
    for s in easy:
        out.append(_q(s, "Easy", ["Start with requirements", "Draw boxes"], ["API", "Storage", "Scaling note"]))
    for s in med:
        out.append(_q(s, "Medium", ["Discuss bottlenecks", "Pick SQL vs NoSQL"], ["Capacity", "Data model", "Failure modes"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Quantify scale", "Discuss hot shards"], ["Sharding", "Consistency", "Observability", "Cost"]))
    return out


def _frontend_bank() -> list[dict]:
    easy = [
        "What is the difference between controlled and uncontrolled inputs in React?",
        "Explain CSS specificity and a common pitfall you have seen.",
        "What are semantic HTML benefits for accessibility?",
        "How does browser caching work for static assets?",
        "Explain same-origin policy at a high level.",
        "What is hydration in SSR frameworks like Next.js?",
        "Describe lazy loading for images and when to use it.",
        "What is CORS and why does it exist?",
    ]
    med = [
        "How would you debug a layout shift (CLS) issue in production?",
        "Explain React Server Components vs client components trade-offs.",
        "How do you prevent unnecessary re-renders in a large React app?",
        "Walk through implementing accessible keyboard navigation for a modal.",
        "Compare CSS-in-JS vs utility CSS for design systems.",
        "How would you implement optimistic UI updates safely?",
        "Explain micro-frontend integration challenges.",
        "How do you handle internationalization and RTL layouts?",
    ]
    hard = [
        "Design a high-performance virtualized list with dynamic row heights.",
        "Explain how you would architect a design system across multiple SPAs.",
        "How would you implement incremental static regeneration pitfalls and cache invalidation?",
        "Deep dive: compare Fiber reconciliation with concurrent rendering implications.",
        "How would you diagnose and fix long tasks blocking the main thread at scale?",
        "Explain advanced Content Security Policy for a complex SaaS app.",
        "How would you build a WYSIWYG editor with collaborative editing constraints?",
        "Discuss edge rendering vs centralized SSR for global latency.",
    ]
    out: list[dict] = []
    for i, s in enumerate(easy):
        out.append(_q(s, "Easy", ["Give a small example"], ["Definition", "Example", "Trade-off"]))
    for s in med:
        out.append(_q(s, "Medium", ["Mention tooling"], ["Problem", "Approach", "Verification"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss scale"], ["Constraints", "Architecture", "Risks"]))
    return out


def _backend_bank() -> list[dict]:
    easy = [
        "What is idempotency for HTTP POST and why does it matter?",
        "Explain REST vs RPC briefly.",
        "What is a database transaction isolation level in simple terms?",
        "Describe JWT structure and a common misuse.",
        "What is connection pooling and why use it?",
        "Explain synchronous vs asynchronous workers.",
        "What is a reverse proxy and typical responsibilities?",
        "Describe basic input validation strategies.",
    ]
    med = [
        "How would you implement retries safely for payment webhooks?",
        "Explain how you would design pagination for a large dataset API.",
        "Compare message queues vs event logs for async workflows.",
        "How do you prevent race conditions when updating inventory?",
        "Walk through strategies for schema migrations with zero downtime.",
        "Explain circuit breakers and where to place them.",
        "How would you implement feature flags server-side safely?",
        "Discuss authentication vs authorization with practical examples.",
    ]
    hard = [
        "Design a multi-region active-active datastore strategy with conflict resolution.",
        "Explain sagas vs two-phase commit for distributed transactions.",
        "How would you design an exactly-once processing system realistically?",
        "Discuss backpressure strategies in high throughput services.",
        "How would you secure internal service-to-service communication at scale?",
        "Explain leader election and common failure modes.",
        "How would you shard a relational workload that has hot tenants?",
        "Discuss designing a durable workflow engine.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Use a concrete example"], ["Concept", "Example", "Pitfall"]))
    for s in med:
        out.append(_q(s, "Medium", ["Mention monitoring"], ["Design", "Edge cases", "Testing"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss failure"], ["Architecture", "Consistency", "Operability"]))
    return out


def _fullstack_bank() -> list[dict]:
    easy = [
        "Describe how you structure a typical full-stack feature ticket.",
        "What is environment configuration separation between frontend and backend?",
        "Explain API versioning basics.",
        "How do you handle errors consistently across client and server?",
        "What is SSR and one benefit for SEO?",
        "Describe how you would log requests across services minimally.",
        "What is CSRF and a mitigation?",
        "Explain why HTTPS matters end-to-end.",
    ]
    med = [
        "Walk through implementing auth from browser to database safely.",
        "How would you design file uploads through API to object storage?",
        "Explain end-to-end testing strategy for a full-stack app.",
        "How would you implement role-based access control across UI and API?",
        "Discuss caching layers from browser to CDN to app server.",
        "How would you handle real-time updates (websockets vs polling)?",
        "Explain tracing a request across microservices from UI click.",
        "How would you structure monorepo packages for shared types?",
    ]
    hard = [
        "Design a collaborative whiteboard MVP with conflict handling.",
        "How would you architect multi-tenant billing + usage metering across FE/BE?",
        "Discuss SSR streaming trade-offs with data fetching waterfalls.",
        "How would you implement granular permissions on nested resources?",
        "Design a feature rollout with canary across API and UI.",
        "Explain scaling websockets with sticky sessions vs pub/sub.",
        "How would you secure third-party JS integrations?",
        "Discuss performance budgets enforced in CI for full-stack teams.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Keep it practical"], ["FE", "BE", "Contract"]))
    for s in med:
        out.append(_q(s, "Medium", ["Sequence diagram"], ["Flow", "State", "Failure"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Quantify risk"], ["Security", "Scale", "DX"]))
    return out


def _hr_bank() -> list[dict]:
    easy = [
        "Why are you interested in this role?",
        "What are your compensation expectations and factors?",
        "Where do you see yourself in 2 years?",
        "What is your notice period / availability?",
        "Describe your ideal manager.",
        "What motivates you day-to-day?",
        "How do you prioritize learning vs delivery?",
        "What location/remote preferences do you have?",
    ]
    med = [
        "Walk me through a time you handled a tight deadline with quality risk.",
        "How do you evaluate whether a job opportunity is right for you?",
        "Describe a time you advocated for diversity or inclusion on a team.",
        "Tell me about a time you said no to work that was misaligned.",
        "How do you manage burnout signals in yourself?",
        "Describe how you negotiate scope with PMs.",
        "Tell me about a time you had to learn a domain quickly (finance, healthcare, etc.).",
        "How do you document decisions for future teammates?",
    ]
    hard = [
        "Describe a time you had to leave a job or team—how did you handle the transition?",
        "Tell me about navigating organizational politics constructively.",
        "How would you handle discovering ethical issues in a product?",
        "Describe leading without a formal title.",
        "Tell me about a time compensation or leveling felt unfair—what did you do?",
        "How do you approach long-term career bets vs short-term rewards?",
        "Describe handling a reorg that impacted your roadmap.",
        "Tell me about rebuilding morale after layoffs (without breaking confidentiality).",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Be concise"], ["Clarity", "Honesty", "Fit"]))
    for s in med:
        out.append(_q(s, "Medium", ["Give specifics"], ["Context", "Action", "Outcome"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Show maturity"], ["Judgment", "Empathy", "Boundaries"]))
    return out


def _aiml_bank() -> list[dict]:
    easy = [
        "What is supervised vs unsupervised learning?",
        "Explain train/validation/test split purpose.",
        "What is overfitting and one way to detect it?",
        "Define precision and recall.",
        "What is embedding space in simple terms?",
        "Explain batch size impact on training.",
        "What is a confusion matrix?",
        "Describe gradient descent intuitively.",
    ]
    med = [
        "How would you evaluate an LLM application beyond accuracy?",
        "Explain RAG architecture components and failure modes.",
        "How do you handle prompt injection risks in a customer-facing bot?",
        "Describe fine-tuning vs prompting trade-offs.",
        "How would you monitor model drift in production?",
        "Explain quantization benefits and drawbacks.",
        "How would you design an offline evaluation harness for ranking?",
        "Discuss bias evaluation steps before shipping a model.",
    ]
    hard = [
        "Design a retrieval system for enterprise docs with ACL enforcement.",
        "Explain how you would scale inference for bursty traffic cost-effectively.",
        "Discuss alignment techniques and their operational costs.",
        "How would you implement reinforcement learning from human feedback at a high level?",
        "Explain causal inference vs correlational ML pitfalls with an example.",
        "How would you architect multi-modal models in a product pipeline?",
        "Discuss differential privacy considerations for analytics ML.",
        "Explain how you would debug a sudden quality regression in an LLM feature.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Define terms"], ["Definition", "Example"]))
    for s in med:
        out.append(_q(s, "Medium", ["Use a diagram"], ["Components", "Metrics", "Risks"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss scale"], ["System", "Safety", "Cost"]))
    return out


def _dsa_bank() -> list[dict]:
    easy = [
        "Implement two-sum with a hash map—what is complexity?",
        "Reverse a linked list iteratively.",
        "Detect a cycle in a linked list.",
        "Valid parentheses using a stack.",
        "Binary search on a sorted array—common bug?",
        "Find max subarray sum (Kadane) idea.",
        "BFS vs DFS when to use each?",
        "What is a heap and one typical use case?",
    ]
    med = [
        "Design LRU cache—data structures and complexities.",
        "Merge K sorted lists approach trade-offs.",
        "Longest increasing subsequence n log n approach outline.",
        "Graph shortest path with weights—algorithm choice?",
        "Topological sort and detecting cycles.",
        "Implement min stack in O(1).",
        "Sliding window maximum using deque idea.",
        "Trie use cases and node structure.",
    ]
    hard = [
        "Solve weighted interval scheduling with DP—state definition?",
        "Discuss union-find optimizations and applications.",
        "Design a data structure for range updates and range queries.",
        "Explain segment trees vs Fenwick trees trade-offs.",
        "Hard: minimum cost to connect points (MST) approach.",
        "Discuss max flow min cut intuition with an example.",
        "Solve digit DP pattern at high level.",
        "Explain heavy-light decomposition use case briefly.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["State complexity"], ["Idea", "Complexity", "Edge cases"]))
    for s in med:
        out.append(_q(s, "Medium", ["Walk through example"], ["Data structure", "Steps", "Complexity"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Prove correctness sketch"], ["State", "Transition", "Optimization"]))
    return out


def _db_bank() -> list[dict]:
    easy = [
        "Primary key vs unique constraint?",
        "What is an index and a downside?",
        "Explain 1NF vs denormalization trade-off.",
        "What is a foreign key?",
        "Describe ACID briefly.",
        "What is a transaction log used for?",
        "Explain JOIN vs subquery performance intuition.",
        "What is a covering index?",
    ]
    med = [
        "How would you diagnose a slow query in Postgres?",
        "Explain MVCC at a high level.",
        "Compare OLTP vs OLAP workloads.",
        "How do you design migrations for large tables?",
        "Explain sharding strategies and hotspot risks.",
        "What is read replica lag and how it affects UX?",
        "Describe optimistic locking implementation.",
        "Explain CAP as it relates to Cassandra vs Postgres.",
    ]
    hard = [
        "Design a globally consistent booking system storage layer.",
        "Explain serializable isolation implementations (2PL vs SSI) trade-offs.",
        "How would you implement change data capture reliably?",
        "Discuss leaderless vs leader-based replication.",
        "How would you handle schema evolution in event-sourced systems?",
        "Explain B+tree internals relevance to SSDs.",
        "Design a time-series DB ingestion path.",
        "Discuss vector index trade-offs for embeddings at scale.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Give example"], ["Concept", "Example"]))
    for s in med:
        out.append(_q(s, "Medium", ["Mention EXPLAIN"], ["Diagnosis", "Fix", "Verification"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss failures"], ["Model", "Consistency", "Ops"]))
    return out


def _cloud_bank() -> list[dict]:
    easy = [
        "What is IaC and a benefit?",
        "Explain regions vs availability zones.",
        "What is autoscaling?",
        "Describe load balancer responsibilities.",
        "What is a container image?",
        "Explain blue/green deployments.",
        "What is secrets management and why centralize?",
        "Describe IAM least privilege.",
    ]
    med = [
        "How would you design CI/CD for a Kubernetes service?",
        "Explain network policies in Kubernetes purpose.",
        "Compare Lambda vs containers for a bursty API.",
        "How do you implement infrastructure drift detection?",
        "Discuss observability pillars with examples.",
        "How would you secure an S3 bucket for a public website?",
        "Explain canary deployments with metrics gates.",
        "How would you manage multi-account AWS landing zones?",
    ]
    hard = [
        "Design multi-region Kubernetes failover for stateful workloads.",
        "Discuss service mesh overhead vs benefits at scale.",
        "How would you implement zero-trust networking for internal services?",
        "Explain cost optimization strategies for big data on cloud.",
        "Design disaster recovery with RPO/RTO targets.",
        "Discuss supply chain security for container builds.",
        "How would you run GPUs cost-effectively for training jobs?",
        "Explain controlling egress from private subnets securely.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Name a tool"], ["Concept", "Example"]))
    for s in med:
        out.append(_q(s, "Medium", ["Draw pipeline"], ["Design", "Security", "Rollback"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Quantify SLOs"], ["Architecture", "Failure", "Cost"]))
    return out


def _oops_bank() -> list[dict]:
    easy = [
        "What is encapsulation?",
        "Explain inheritance vs composition.",
        "What is polymorphism with an example?",
        "Define abstraction in OOP.",
        "What is an interface used for?",
        "Explain static vs instance methods.",
        "What is method overriding?",
        "Describe SOLID letter S briefly.",
    ]
    med = [
        "Explain dependency injection benefits.",
        "Compare abstract class vs interface in Java context.",
        "What is Liskov substitution violation example?",
        "Discuss immutability benefits in OOP designs.",
        "Explain design pattern: Factory vs Builder when to choose.",
        "How does composition help testing?",
        "Explain anti-pattern: God class.",
        "Discuss exception handling design principles.",
    ]
    hard = [
        "Design a plugin architecture using OOP principles.",
        "Explain covariance vs contravariance relevance to generics.",
        "Discuss domain-driven design aggregates with consistency boundaries.",
        "How would you model complex business rules without nested ifs?",
        "Explain double dispatch and a use case.",
        "Discuss object-relational impedance mismatch mitigation.",
        "How would you design extensible enums safely?",
        "Explain how to avoid inheritance misuse in large codebases.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Give example"], ["Definition", "Example"]))
    for s in med:
        out.append(_q(s, "Medium", ["Relate to testing"], ["Principle", "Example", "Trade-off"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss evolution"], ["Model", "Boundaries", "Testing"]))
    return out


def _os_bank() -> list[dict]:
    easy = [
        "What is a process vs a thread?",
        "Explain virtual memory idea.",
        "What is a context switch?",
        "Describe deadlock necessary conditions.",
        "What is paging?",
        "Explain file descriptor.",
        "What is scheduling fairness goal?",
        "Describe syscall in one sentence.",
    ]
    med = [
        "Explain mutex vs semaphore.",
        "How does copy-on-write work in fork?",
        "Describe page faults and performance impact.",
        "Explain Linux OOM killer behavior at high level.",
        "Compare epoll vs select.",
        "How do CPU caches affect concurrent data structures?",
        "Explain mmap benefits and risks.",
        "Describe inode structure purpose.",
    ]
    hard = [
        "Discuss lock-free vs wait-free algorithms trade-offs.",
        "Explain memory ordering and why it matters for concurrency.",
        "How would you design a user-space thread scheduler?",
        "Discuss meltdown/spectre class mitigations impact.",
        "Explain NUMA effects on database performance.",
        "How would you debug a memory leak in a native service?",
        "Discuss io_uring advantages.",
        "Explain kernel bypass networking concepts.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Sketch diagram"], ["Concept", "Example"]))
    for s in med:
        out.append(_q(s, "Medium", ["Mention Linux"], ["Mechanism", "Implication"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss hardware"], ["Model", "Risk", "Mitigation"]))
    return out


def _cyber_bank() -> list[dict]:
    easy = [
        "What is XSS and a mitigation?",
        "Explain SQL injection basics.",
        "What is MFA and why it matters?",
        "Describe hashing vs encryption.",
        "What is TLS?",
        "Explain principle of least privilege.",
        "What is phishing?",
        "Describe a firewall role.",
    ]
    med = [
        "Explain OWASP Top 10 item choices for APIs.",
        "How would you threat-model a new microservice?",
        "Discuss SSRF defenses in depth.",
        "How do you secure CI/CD pipelines?",
        "Explain zero-day response steps.",
        "How would you implement secret rotation?",
        "Discuss encryption at rest key management options.",
        "Explain supply chain attacks in dependencies.",
    ]
    hard = [
        "Design a zero-trust access policy for internal admin tools.",
        "Discuss side-channel attacks on crypto implementations.",
        "How would you architect SIEM ingestion at scale?",
        "Explain post-quantum crypto migration considerations.",
        "Discuss secure enclaves trade-offs.",
        "How would you perform incident containment for ransomware?",
        "Explain advanced persistent threat detection challenges.",
        "Discuss formal verification limits in security-critical code.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Give example"], ["Threat", "Mitigation"]))
    for s in med:
        out.append(_q(s, "Medium", ["Use STRIDE"], ["Asset", "Attacker", "Controls"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss org process"], ["Detect", "Respond", "Harden"]))
    return out


def _mobile_bank() -> list[dict]:
    easy = [
        "Activity vs Fragment in Android?",
        "Explain SwiftUI state vs binding briefly.",
        "What is app lifecycle on mobile?",
        "Describe push notification flow at high level.",
        "What is deep linking?",
        "Explain offline-first basics.",
        "What is ProGuard/R8 used for?",
        "Describe mobile analytics privacy considerations.",
    ]
    med = [
        "How would you architect networking layer with retries on mobile?",
        "Explain handling background tasks on iOS vs Android differences.",
        "Discuss image loading and caching strategies.",
        "How would you implement biometric auth securely?",
        "Explain testing strategy for mobile CI.",
        "Discuss app size optimization techniques.",
        "How would you handle localization and pluralization?",
        "Explain navigation architecture patterns (MVVM etc.).",
    ]
    hard = [
        "Design offline sync with conflict resolution for notes app.",
        "Discuss rendering performance profiling on low-end Android devices.",
        "How would you secure local storage for sensitive tokens?",
        "Explain modularization in large mobile apps.",
        "Discuss building a design system across iOS/Android.",
        "How would you implement feature flags on mobile safely?",
        "Explain app attestation / integrity checks trade-offs.",
        "Discuss scaling real-time features (chat) on mobile clients.",
    ]
    out = []
    for s in easy:
        out.append(_q(s, "Easy", ["Platform example"], ["Concept", "Example"]))
    for s in med:
        out.append(_q(s, "Medium", ["Mention tooling"], ["Design", "Testing", "UX"]))
    for s in hard:
        out.append(_q(s, "Hard", ["Discuss constraints"], ["Security", "Performance", "Maintainability"]))
    return out


def build_bank() -> dict[str, list[dict]]:
    return {
        "Behavioral & Culture Fit": _behavioral_bank(),
        "System Design": _system_design_bank(),
        "Frontend Technical": _frontend_bank(),
        "Backend Technical": _backend_bank(),
        "Full Stack": _fullstack_bank(),
        "HR Screening": _hr_bank(),
        "AI/ML": _aiml_bank(),
        "Data Structures & Algorithms": _dsa_bank(),
        "Database Systems": _db_bank(),
        "Cloud & DevOps": _cloud_bank(),
        "OOPs": _oops_bank(),
        "Operating Systems": _os_bank(),
        "Cybersecurity": _cyber_bank(),
        "Mobile Development": _mobile_bank(),
    }


BANK = build_bank()


def pick_question(interview_type: str, difficulty: str, past_questions: list[str] | None) -> dict:
    past = set(past_questions or [])
    pool = BANK.get(interview_type) or BANK["Behavioral & Culture Fit"]
    candidates = [q for q in pool if q["difficulty"] == difficulty and q["question"] not in past]
    if not candidates:
        candidates = [q for q in pool if q["difficulty"] == difficulty]
    if not candidates:
        candidates = pool[:]
    return random.choice(candidates)
