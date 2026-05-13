import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.data.question_bank import pick_question

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


class InterviewAgent:
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

    def generate_question(
        self, interview_type: str, difficulty: str, past_questions: list | None = None
    ) -> dict:
        past = past_questions or []
        bank_q = pick_question(interview_type, difficulty, past)
        if bank_q and bank_q.get("question") not in past:
            return {
                "question": bank_q["question"],
                "hints": bank_q.get("hints", []),
                "ideal_answer_key_points": bank_q.get("ideal_answer_key_points", []),
                "source": "bank",
            }

        past_q_text = ""
        if past:
            past_q_text = (
                "Do NOT repeat these questions: " + json.dumps(past[-12:])
            )

        prompt = PromptTemplate.from_template(
            """
            You are an expert interviewer.
            Interview type (STRICT): {interview_type}
            Difficulty (STRICT): {difficulty}

            Difficulty rules:
            - Easy: definitions, straightforward scenarios, small scope.
            - Medium: practical trade-offs, system component depth, real workflows.
            - Hard: deep dives, large-scale constraints, fault tolerance, performance, security.

            The question MUST be directly about {interview_type} topics only.
            {past_questions_context}

            Return JSON ONLY:
            {{
              "question": "...",
              "hints": ["...", "..."],
              "ideal_answer_key_points": ["...", "...", "..."]
            }}
            """
        )

        try:
            chain = prompt | self.llm
            response = chain.invoke(
                {
                    "interview_type": interview_type,
                    "difficulty": difficulty,
                    "past_questions_context": past_q_text,
                }
            )
            cleaned = response.content.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3]
            data = json.loads(cleaned)
            data["source"] = "llm"
            return data
        except Exception:
            return {
                "question": bank_q["question"],
                "hints": bank_q.get("hints", []),
                "ideal_answer_key_points": bank_q.get("ideal_answer_key_points", []),
                "source": "bank_fallback",
            }

    def evaluate_answer(self, question: str, user_answer: str, ideal_points: list) -> dict:
        prompt = PromptTemplate.from_template(
            """
            You are a STRICT but fair expert technical interviewer.

            The question was: "{question}"
            The ideal key points to cover were: {ideal_points}

            The candidate answered (transcribed via speech-to-text, may have typos):
            "{user_answer}"

            SCORING RULES (you MUST follow these exactly):
            - If the answer is EMPTY, blank, or just "I don't know": score MUST be 5-15
            - If the answer is WRONG or completely off-topic: score MUST be 15-30
            - If the answer is VAGUE with no specifics: score MUST be 30-50
            - If the answer covers SOME points but misses key ones: score MUST be 50-70
            - If the answer is GOOD and covers most key points: score MUST be 70-85
            - If the answer is EXCELLENT and comprehensive: score MUST be 85-100

            "passed" should be true ONLY if score >= 60.

            Return EXACTLY in this JSON format:
            {{
              "score": <number 0-100>,
              "feedback": "Detailed feedback explaining what was good, what was missed, and specific improvement tips.",
              "passed": <true or false>,
              "strengths": ["strength1", "strength2"],
              "weaknesses": ["weakness1", "weakness2"]
            }}
            """
        )

        if not user_answer or user_answer.strip().lower() in [
            "i don't know",
            "i don't know.",
            "idk",
            "",
        ]:
            return {
                "score": 10,
                "feedback": "No answer was provided. Please try speaking your answer clearly into the microphone.",
                "passed": False,
                "strengths": [],
                "weaknesses": ["No response given"],
            }

        try:
            chain = prompt | self.llm
            response = chain.invoke(
                {
                    "question": question,
                    "ideal_points": ideal_points,
                    "user_answer": user_answer,
                }
            )
            cleaned = response.content.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3]
            result = json.loads(cleaned)
            result["passed"] = result.get("score", 0) >= 60
            return result
        except Exception:
            if len(user_answer.strip()) < 20:
                return {
                    "score": 25,
                    "feedback": "Your answer was too brief. Expand on key concepts.",
                    "passed": False,
                    "strengths": ["Attempted answer"],
                    "weaknesses": ["Too brief"],
                }
            return {
                "score": 55,
                "feedback": "Your answer showed some understanding but lacked depth. Try to be more specific.",
                "passed": False,
                "strengths": ["Attempted answer"],
                "weaknesses": ["Needs more detail"],
            }
