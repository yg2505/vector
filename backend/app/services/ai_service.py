import os
import json
from groq import Groq
from ..config import settings

# Predefined skill maps for target roles
ROLE_SKILL_MAPS = {
    "Frontend Developer": [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", 
        "Tailwind CSS", "Redux", "Webpack", "Vite", "Git", "REST APIs"
    ],
    "Backend Developer": [
        "Python", "Go", "Java", "Node.js", "Express", "FastAPI", 
        "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "REST APIs", "gRPC"
    ],
    "Full Stack Developer": [
        "JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL", 
        "Tailwind CSS", "Express", "Git", "Docker", "REST APIs", "CI/CD"
    ],
    "AI Engineer": [
        "Python", "Machine Learning", "Deep Learning", "NLP", "Transformers", 
        "Prompt Engineering", "RAG", "Vector Databases", "LangChain", 
        "LangGraph", "Docker", "AWS"
    ],
    "ML Engineer": [
        "Python", "Scikit-Learn", "TensorFlow", "PyTorch", "MLOps", 
        "Docker", "Kubernetes", "Feature Stores", "SQL", "Git", "Pandas", "NumPy"
    ],
    "Data Analyst": [
        "SQL", "Python", "Pandas", "NumPy", "Excel", "Tableau", 
        "Power BI", "A/B Testing", "Data Visualization", "Statistics"
    ],
    "Data Scientist": [
        "Python", "R", "SQL", "Machine Learning", "Deep Learning", "Statistics", 
        "Pandas", "NumPy", "PyTorch", "Data Modeling", "Feature Engineering"
    ],
    "DevOps Engineer": [
        "Linux", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", 
        "Terraform", "AWS", "Bash Scripting", "Prometheus", "Grafana", "Nginx", "Git"
    ]
}

class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.has_key = len(self.api_key.strip()) > 0
        if self.has_key:
            self.client = Groq(api_key=self.api_key)
        else:
            self.client = None
            print("WARNING: GROQ_API_KEY is not set. Using local mock fallbacks for AI services.")

    def _call_groq_json(self, prompt: str) -> dict:
        """Helper to invoke Groq requesting JSON output."""
        if not self.has_key or not self.client:
            raise ValueError("Groq API key is not configured.")
        
        try:
            response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Groq API Error: {str(e)}")
            raise e

    def analyze_resume(self, resume_text: str, target_role: str) -> dict:
        """Runs ATS score and resume improvement suggestions."""
        if not self.has_key:
            return self._mock_resume_analysis(resume_text, target_role)

        prompt = f"""
        You are an expert ATS (Applicant Tracking System) reviewer and corporate recruiter.
        Analyze the following resume text:
        ---
        {resume_text}
        ---
        For the target role: {target_role if target_role else 'General Software Engineer'}

        Evaluate the resume thoroughly. Give constructive feedback. Make sure your rewrite suggestions focus on using strong action verbs, quantifiable achievements, and modern phrasing.

        Provide feedback strictly in the following JSON format:
        {{
          "ats_score": <int between 0 and 100>,
          "strengths": [<list of strings highlighting strong points in the resume>],
          "weaknesses": [<list of critical gaps, weak phrasing, or formatting issues>],
          "rewrite_suggestions": [
            {{
              "original": "<original weak line or project description>",
              "improved": "<improved strong line with action verbs and metrics>",
              "rationale": "<brief explanation of why this change helps>"
            }}
          ],
          "keyword_recommendations": [<list of key skills/keywords the user should add to match the target role>]
        }}
        """
        try:
            return self._call_groq_json(prompt)
        except Exception:
            return self._mock_resume_analysis(resume_text, target_role)

    def analyze_skill_gaps(self, resume_text: str, target_role: str) -> dict:
        """Compares user's resume text against predefined skills for target role."""
        standard_skills = ROLE_SKILL_MAPS.get(target_role, ["Python", "SQL", "Git", "Docker"])

        if not self.has_key:
            return self._mock_skill_gap_analysis(resume_text, target_role)

        prompt = f"""
        You are an expert career counselor. Analyze the user's resume/profile text:
        ---
        {resume_text}
        ---

        The standard skills expected for the role of '{target_role}' are:
        {', '.join(standard_skills)}

        Compare the user's skills against these expected skills. Output a JSON object containing:
        {{
          "readiness_percentage": <int between 0 and 100 representing how ready the user is based on matching skills>,
          "mastered_skills": [<list of strings of skills from the standard list that the user HAS in their resume>],
          "missing_skills": [<list of strings of skills from the standard list that the user is MISSING or has weak exposure to>],
          "category_gaps": {{
             "Languages & Core": [<list of missing skills in this category>],
             "Frameworks & Tools": [<list of missing skills in this category>],
             "Architecture & Deploy": [<list of missing skills in this category>]
          }}
        }}
        """
        try:
            return self._call_groq_json(prompt)
        except Exception:
            return self._mock_skill_gap_analysis(resume_text, target_role)

    def generate_roadmap(self, target_role: str, missing_skills: list, study_hours: int, timeline_months: int) -> list:
        """Generates weekly roadmap items to fill skill gaps."""
        if not self.has_key:
            return self._mock_roadmap(target_role, missing_skills, study_hours, timeline_months)

        skills_str = ", ".join(missing_skills) if missing_skills else "General core subjects"
        prompt = f"""
        You are an AI Roadmap Agent. Create a week-by-week learning roadmap for a user who wants to become a '{target_role}'.
        User profile:
        - Target Role: {target_role}
        - Missing Skills to Learn: {skills_str}
        - Study Time: {study_hours} hours per week
        - Career Timeline: {timeline_months} months

        Generate a structured roadmap divided into weekly milestones.
        Format the output as a JSON array of weekly tasks, where each task has:
        {{
          "week_number": <int, consecutive starting from 1>,
          "month_number": <int, starting from 1>,
          "title": "<Short title, e.g. Master Docker Basics>",
          "description": "<Detailed description of what to learn and do this week, including a mini-project or practical task>",
          "category": "<e.g. Core, Tools, Advanced>",
          "resources": [
             {{
               "title": "<Resource title, e.g. Docker Official Docs>",
               "url": "<Recommended learning link, e.g. 'https://docs.docker.com' or a standard learning URL>"
             }}
          ]
        }}
        Generate exactly {timeline_months * 4} weeks of milestones (4 weeks per month).
        """
        try:
            res = self._call_groq_json(prompt)
            if isinstance(res, list):
                return res
            elif isinstance(res, dict) and "roadmap" in res:
                return res["roadmap"]
            return self._mock_roadmap(target_role, missing_skills, study_hours, timeline_months)
        except Exception:
            return self._mock_roadmap(target_role, missing_skills, study_hours, timeline_months)

    def chat_coach(self, message: str, user_role: str, user_goal: str, missing_skills: list, upcoming_tasks: list, vector_context: list, chat_history: list) -> str:
        """Interact with the Career Coach. Returns a text response."""
        if not self.has_key or not self.client:
            return self._mock_chat_response(message, user_role, upcoming_tasks)

        # Build context prompt
        history_prompt = ""
        for msg in chat_history[-6:]:
            role_label = "User" if msg["role"] == "user" else "Coach"
            history_prompt += f"{role_label}: {msg['content']}\n"

        missing_skills_str = ", ".join(missing_skills) if missing_skills else "None"
        upcoming_tasks_str = "\n".join([f"- Week {t.week_number}: {t.title}" for t in upcoming_tasks[:3]]) if upcoming_tasks else "None"
        
        vector_context_str = ""
        if vector_context:
            vector_context_str = "\n".join([f"- {d['document']}" for d in vector_context])

        prompt = f"""
        You are Vector, an elite AI Career Coach and Learning Mentor. Your job is to help the user land a job as a '{user_role}'.
        User Details:
        - Target Role: {user_role}
        - Personal Goal: {user_goal}
        - Missing Skills to Master: {missing_skills_str}
        
        Upcoming Roadmap Milestones:
        {upcoming_tasks_str}

        Relevant User Information (from Resumes/Notes):
        {vector_context_str}

        Guidelines:
        1. Be highly actionable, encouraging, and clear.
        2. Leverage their specific upcoming milestones or missing skills when giving advice.
        3. Refer to yourself as Vector. Keep it conversational but professional.

        Chat History:
        {history_prompt}

        User: {message}
        Coach:
        """
        try:
            response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Hi! I'm Vector, your career coach. I noticed you asked: '{message}'. Let's look at how we can help you work towards your goal of becoming a {user_role}. Currently, your upcoming roadmap focuses on mastering missing skills like {missing_skills_str}."

    # --- MOCK FALLBACKS ---

    def _mock_resume_analysis(self, resume_text: str, target_role: str) -> dict:
        return {
            "ats_score": 68,
            "strengths": [
                "Good foundation in programming core principles",
                "Clear contact info and professional summary",
                "Demonstrated teamwork through academic projects"
            ],
            "weaknesses": [
                "Missing direct metrics showing impact (e.g. percentages, hours saved)",
                "Weak bullet points: 'Worked on React application' doesn't demonstrate value",
                f"Missing critical keywords for {target_role}"
            ],
            "rewrite_suggestions": [
                {
                    "original": "Worked on React application to build dashboard pages.",
                    "improved": "Co-authored and launched a responsive React-based admin dashboard, reducing report latency by 40%.",
                    "rationale": "Uses strong action verbs ('Co-authored', 'launched') and includes a tangible business metric."
                },
                {
                    "original": "Responsible for maintaining backend APIs.",
                    "improved": "Maintained and optimized FastAPI backend endpoints, reducing SQL execution times by 25% via index indexing.",
                    "rationale": "Highlights specific technologies and technical problem-solving results."
                }
            ],
            "keyword_recommendations": ROLE_SKILL_MAPS.get(target_role, ["Docker", "Kubernetes", "AWS", "CI/CD"])[:4]
        }

    def _mock_skill_gap_analysis(self, resume_text: str, target_role: str) -> dict:
        standard_skills = ROLE_SKILL_MAPS.get(target_role, ["Python", "SQL", "Git"])
        
        # Simple simulation: let's match some skills based on text search or pick standard subsets
        text_lower = resume_text.lower() if resume_text else ""
        mastered = []
        missing = []
        for s in standard_skills:
            if s.lower() in text_lower:
                mastered.append(s)
            else:
                missing.append(s)
        
        # If resume is blank/mock, make some up
        if not mastered:
            mastered = standard_skills[:min(3, len(standard_skills))]
            missing = standard_skills[min(3, len(standard_skills)):]
            
        readiness = int((len(mastered) / len(standard_skills)) * 100) if standard_skills else 50
        
        # Split missing into categories
        cat_gaps = {
            "Languages & Core": [s for s in missing[:2]],
            "Frameworks & Tools": [s for s in missing[2:5]],
            "Architecture & Deploy": [s for s in missing[5:]]
        }
        
        return {
            "readiness_percentage": readiness,
            "mastered_skills": mastered,
            "missing_skills": missing,
            "category_gaps": {k: v for k, v in cat_gaps.items() if v}
        }

    def _mock_roadmap(self, target_role: str, missing_skills: list, study_hours: int, timeline_months: int) -> list:
        skills_to_use = missing_skills if missing_skills else ROLE_SKILL_MAPS.get(target_role, ["Core Programming"])
        weeks = timeline_months * 4
        roadmap = []
        
        for w in range(1, weeks + 1):
            m = ((w - 1) // 4) + 1
            skill_idx = (w - 1) % len(skills_to_use)
            skill = skills_to_use[skill_idx]
            
            roadmap.append({
                "week_number": w,
                "month_number": m,
                "title": f"Master {skill} - Foundations",
                "description": f"Dive deep into {skill} fundamentals. Build a mini-project utilizing {skill} for about {study_hours} hours this week.",
                "category": "Core Concept" if w < weeks / 2 else "Advanced",
                "resources": [
                    {
                        "title": f"{skill} Starter Guide",
                        "url": f"https://roadmap.sh"
                    }
                ]
            })
        return roadmap

    def _mock_chat_response(self, message: str, user_role: str, upcoming_tasks: list) -> str:
        upcoming_str = upcoming_tasks[0].title if upcoming_tasks else "your learning modules"
        return f"Hey there! I am Vector, your career mentor. Since you are working towards becoming a {user_role or 'Software Developer'}, I'd recommend focusing on your next milestone: '{upcoming_str}'. How can I help you tackle that today?"

ai_service = AIService()
