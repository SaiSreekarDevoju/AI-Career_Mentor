import json

from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings


class RoadmapAgent:
    def __init__(self):
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.3,
            )
        return self._llm

    def generate_roadmap(self, target_role: str, missing_skills: list) -> dict:
        return self.generate_roadmap_extended(target_role, missing_skills)

    def generate_roadmap_extended(self, target_role: str, missing_skills: list) -> dict:
        skills = ", ".join(missing_skills) if missing_skills else "Core fundamentals"
        prompt = PromptTemplate.from_template(
            """
            You are an expert AI Career Coach.
            Build a skill-based roadmap to help the user become: {target_role}.
            They must strengthen: {missing_skills}.

            Return EXACTLY valid JSON (no markdown) with this shape:
            {{
              "goals": [
                {{"id": "g1", "title": "string", "progress": 0, "editable": true}}
              ],
              "daily_tasks": [
                {{"id": "d1", "name": "string", "done": false, "day": 1}}
              ],
              "milestones": [
                {{"id": "m1", "title": "string", "week": 1, "done": false}}
              ],
              "weeks": [
                {{
                  "week": "Week 1",
                  "title": "string",
                  "tasks": [
                    {{"id": "t1", "name": "string", "done": false, "skill_tags": ["tag1","tag2"]}}
                  ]
                }}
              ]
            }}

            Rules:
            - Provide exactly 3 weekly milestones (Week 1..3).
            - Each week: at least 4 tasks, actionable, tied to listed skills where possible.
            - Provide 7 daily_tasks (one per day) for the first week, small concrete actions.
            - Provide 2-3 goals with progress starting between 5-25 (percent) based on realism.
            - IDs must be stable short strings (g1,d1,t1... unique across entire JSON).
            """
        )
        try:
            chain = prompt | self.llm
            response = chain.invoke(
                {"target_role": target_role, "missing_skills": skills}
            )
            cleaned = response.content.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3]
            data = json.loads(cleaned)
            data.setdefault("goals", [])
            data.setdefault("daily_tasks", [])
            data.setdefault("milestones", [])
            data.setdefault("weeks", [])
            return data
        except Exception:
            w1_tasks = [
                {
                    "id": "t1",
                    "name": f"Study fundamentals for {target_role}",
                    "done": False,
                    "skill_tags": missing_skills[:1] if missing_skills else ["Core"],
                },
                {
                    "id": "t2",
                    "name": "Complete one hands-on exercise with notes",
                    "done": False,
                    "skill_tags": ["Practice"],
                },
            ]
            return {
                "goals": [
                    {
                        "id": "g1",
                        "title": f"Become interview-ready for {target_role}",
                        "progress": 10,
                        "editable": True,
                    }
                ],
                "daily_tasks": [
                    {"id": "d1", "name": "30m focused learning block", "done": False, "day": 1},
                    {"id": "d2", "name": "1 implementation kata", "done": False, "day": 2},
                ],
                "milestones": [
                    {"id": "m1", "title": "Foundations complete", "week": 1, "done": False},
                    {"id": "m2", "title": "Project milestone", "week": 2, "done": False},
                    {"id": "m3", "title": "Interview readiness checkpoint", "week": 3, "done": False},
                ],
                "weeks": [
                    {
                        "week": "Week 1",
                        "title": "Foundations",
                        "tasks": w1_tasks,
                    },
                    {
                        "week": "Week 2",
                        "title": "Build",
                        "tasks": [
                            {
                                "id": "t3",
                                "name": "Ship a small portfolio project slice",
                                "done": False,
                                "skill_tags": ["Project"],
                            }
                        ],
                    },
                    {
                        "week": "Week 3",
                        "title": "Polish",
                        "tasks": [
                            {
                                "id": "t4",
                                "name": "Mock interview + retrospective",
                                "done": False,
                                "skill_tags": ["Communication"],
                            }
                        ],
                    },
                ],
            }
