import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

class SkillGapAgent:
    def __init__(self):
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.2
            )
        return self._llm

    def analyze_gap(self, user_skills: list, target_role: str) -> dict:
        prompt = PromptTemplate.from_template(
            """
            You are an AI Tech Recruiter.
            Analyze the user's current skills: {user_skills} against the standard requirements for a {target_role}.
            
            Return the output EXACTLY in this JSON format:
            {{
              "readiness_score": 75,
              "priority_missing": [
                {{
                  "title": "Skill Name",
                  "current": 20,
                  "required": 85,
                  "timeToLearn": "~2 weeks"
                }}
              ],
              "recommendations": [
                {{
                  "title": "Name of cert/project",
                  "desc": "Short description",
                  "type": "Project" 
                }}
              ]
            }}
            
            Do not wrap the response in markdown blocks like ```json.
            """
        )
        
        try:
            chain = prompt | self.llm
            response = chain.invoke({"target_role": target_role, "user_skills": ", ".join(user_skills)})
            
            cleaned = response.content.strip()
            if cleaned.startswith("```json"): cleaned = cleaned[7:-3]
            elif cleaned.startswith("```"): cleaned = cleaned[3:-3]
                
            return json.loads(cleaned)
        except:
            return {
                "readiness_score": 50,
                "priority_missing": [
                    {"title": "System Design", "current": 30, "required": 85, "timeToLearn": "~3 weeks"},
                    {"title": "Cloud Deployment", "current": 15, "required": 75, "timeToLearn": "~4 weeks"}
                ],
                "recommendations": [
                    {"title": "AWS Solutions Architect", "desc": "Industry standard cloud certification.", "type": "Certification"},
                    {"title": "Build a Microservices App", "desc": "Practice distributed system design.", "type": "Project"}
                ]
            }
