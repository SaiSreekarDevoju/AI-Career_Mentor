import json
import re
from collections import Counter

from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
import PyPDF2
import docx
from io import BytesIO


SECTION_HEADERS = [
    "experience",
    "education",
    "skills",
    "projects",
    "summary",
    "objective",
    "certifications",
    "publications",
    "awards",
]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def _extract_keywords(text: str, top_n: int = 25) -> list[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.\-]{2,}", _normalize(text))
    stop = {
        "and",
        "the",
        "for",
        "with",
        "using",
        "from",
        "this",
        "that",
        "have",
        "has",
        "was",
        "were",
        "work",
        "team",
        "project",
        "company",
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
    }
    filtered = [t for t in tokens if t not in stop and not t.isdigit()]
    counts = Counter(filtered)
    return [w for w, _ in counts.most_common(top_n)]


def _role_keywords(target_role: str) -> list[str]:
    t = _normalize(target_role)
    parts = re.split(r"[^a-z0-9+#]+", t)
    return [p for p in parts if len(p) > 2]


def compute_ats_signals(resume_text: str, target_role: str) -> dict:
    text = resume_text or ""
    low = _normalize(text)
    role_tokens = _role_keywords(target_role)

    # Keyword match against inferred role requirements (role tokens + common adjacent skills)
    expanded = set(role_tokens)
    for rt in role_tokens:
        if "frontend" in rt or "react" in low:
            expanded.update(["react", "typescript", "javascript", "css", "html"])
        if "backend" in rt or "api" in rt:
            expanded.update(["api", "rest", "sql", "database", "python", "java", "node"])
        if "data" in rt or "ml" in rt or "ai" in rt:
            expanded.update(["python", "sql", "machine", "learning", "model"])
        if "devops" in rt or "cloud" in rt:
            expanded.update(["aws", "docker", "kubernetes", "ci", "cd", "terraform"])

    hits = 0
    matched = []
    for kw in expanded:
        if kw in low:
            hits += 1
            matched.append(kw)
    denom = max(1, len(expanded))
    keyword_pct = round(min(100, (hits / denom) * 100))

    # Section completeness
    present = 0
    section_scores = {}
    for sec in SECTION_HEADERS:
        score = 100 if sec in low else 0
        # crude: header word appears as section-ish
        if sec == "experience" and re.search(r"\b(intern|engineer|developer|software|work)\b", low):
            score = max(score, 70)
        if sec == "education" and re.search(r"\b(university|college|bachelor|master|b\.?s\.?|m\.?s\.?)\b", low):
            score = max(score, 70)
        if sec == "skills" and re.search(r"\b(skills|technical|tools)\b", low):
            score = max(score, 70)
        section_scores[sec] = score
        if score >= 70:
            present += 1
    sections_score = round(sum(section_scores.values()) / max(1, len(section_scores)))

    # Formatting heuristics (length, bullets, contact)
    formatting = 55
    if len(text) > 800:
        formatting += 10
    if re.search(r"[•\-–]\s", text):
        formatting += 10
    if re.search(r"\b(email|@|linkedin|github)\b", low):
        formatting += 10
    formatting = min(100, formatting)

    resume_role_guess = None
    if "engineer" in low:
        resume_role_guess = "engineer track"
    elif "manager" in low or "lead" in low:
        resume_role_guess = "leadership track"
    mismatch = None
    if role_tokens:
        overlap = sum(1 for r in role_tokens if r in low)
        if overlap == 0:
            mismatch = f"Resume does not clearly reflect keywords for '{target_role}'. Align headline and skills."

    # Experience match heuristic: years mentioned
    years = [int(x) for x in re.findall(r"\b(19|20)\d{2}\b", text)]
    exp_score = 60
    if years:
        exp_score = min(95, 60 + min(30, len(set(years)) * 5))

    skill_tokens = _extract_keywords(text, 30)
    gap = [k for k in sorted(expanded) if k not in low][:12]

    ats_core = round(
        keyword_pct * 0.35
        + sections_score * 0.25
        + formatting * 0.15
        + exp_score * 0.15
        + (100 if not mismatch else 70) * 0.10
    )

    return {
        "keyword_match_percent": keyword_pct,
        "matched_keywords": sorted(set(matched))[:20],
        "keyword_gap": gap,
        "section_scores": section_scores,
        "sections_completeness_score": sections_score,
        "formatting_score": formatting,
        "experience_match_score": exp_score,
        "resume_role_guess": resume_role_guess,
        "role_target_mismatch": mismatch,
        "extracted_skills": skill_tokens[:20],
        "deterministic_ats_score": max(35, min(98, ats_core)),
    }


class ResumeAnalyzerAgent:
    def __init__(self):
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.2,
            )
        return self._llm

    def parse_pdf(self, file_bytes: bytes) -> str:
        try:
            reader = PyPDF2.PdfReader(BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                text += (page.extract_text() or "") + "\n"
            return text
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")

    def parse_docx(self, file_bytes: bytes) -> str:
        try:
            doc = docx.Document(BytesIO(file_bytes))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX: {str(e)}")

    def analyze_resume(self, resume_text: str, target_role: str = "Software Engineer") -> dict:
        signals = compute_ats_signals(resume_text, target_role)
        prompt = PromptTemplate.from_template(
            """
            You are an expert AI Career Mentor and ATS Optimization Specialist.
            Analyze the resume text for the target role: {target_role}.

            Use these deterministic signals as HARD priors (do not contradict wildly):
            - keyword_match_percent: {keyword_match_percent}
            - sections_completeness_score: {sections_completeness_score}
            - formatting_score: {formatting_score}
            - experience_match_score: {experience_match_score}

            Return detailed JSON with EXACT keys:
            {{
                "ats_score": <integer 0-100, align within +/-8 of deterministic baseline {baseline} unless strong justification>,
                "summary_feedback": "short paragraph",
                "missing_skills": ["..."],
                "strong_skills": ["..."],
                "weak_sections": ["..."],
                "formatting_score": <0-100>,
                "keyword_gap": ["..."],
                "section_scores": {{ "experience": 0-100, "education": 0-100, "skills": 0-100, "projects": 0-100, "summary": 0-100 }},
                "role_alignment_notes": "explain resume vs target role alignment",
                "improved_bullets": [{{"original": "...", "improved": "..."}}]
            }}

            Resume Text:
            {resume_text}

            Valid JSON only. No markdown fences.
            """
        )

        baseline = signals["deterministic_ats_score"]
        try:
            chain = prompt | self.llm
            response = chain.invoke(
                {
                    "resume_text": resume_text[:12000],
                    "target_role": target_role,
                    "keyword_match_percent": signals["keyword_match_percent"],
                    "sections_completeness_score": signals["sections_completeness_score"],
                    "formatting_score": signals["formatting_score"],
                    "experience_match_score": signals["experience_match_score"],
                    "baseline": baseline,
                }
            )
            cleaned = response.content.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3]
            ai = json.loads(cleaned)
        except Exception:
            ai = {}

        merged_formatting = int(
            ai.get("formatting_score", signals["formatting_score"])
        )
        merged_sections = ai.get("section_scores") or signals["section_scores"]

        ats_ai = int(ai.get("ats_score", baseline))
        # Blend deterministic and model for tamper resistance
        final_ats = int(round(0.55 * baseline + 0.45 * ats_ai))
        final_ats = max(30, min(99, final_ats))

        return {
            "ats_score": final_ats,
            "summary_feedback": ai.get(
                "summary_feedback",
                "Analysis completed using structured ATS signals and model review.",
            ),
            "missing_skills": ai.get("missing_skills", []) or signals["keyword_gap"][:8],
            "strong_skills": ai.get("strong_skills", []) or signals["matched_keywords"][:8],
            "weak_sections": ai.get("weak_sections", [])
            or [k for k, v in signals["section_scores"].items() if v < 70],
            "formatting_score": merged_formatting,
            "keyword_match_percent": signals["keyword_match_percent"],
            "matched_keywords": signals["matched_keywords"],
            "keyword_gap": ai.get("keyword_gap", []) or signals["keyword_gap"],
            "section_scores": merged_sections,
            "experience_match_score": signals["experience_match_score"],
            "role_target_mismatch": signals["role_target_mismatch"],
            "resume_role_guess": signals["resume_role_guess"],
            "role_alignment_notes": ai.get(
                "role_alignment_notes",
                signals["role_target_mismatch"] or "Align headline, skills, and impact bullets with the target role.",
            ),
            "improved_bullets": ai.get("improved_bullets", [])[:6],
            "deterministic_breakdown": {
                "baseline_score": baseline,
                "model_score": ats_ai,
            },
        }
