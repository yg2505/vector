const BASE_URL = "https://vector-nezk.onrender.com/api";

function getHeaders(isMultipart = false): HeadersInit {
  const headers: HeadersInit = {};
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vector_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const isMultipart = options.body instanceof FormData;
  
  const config = {
    ...options,
    headers: {
      ...getHeaders(isMultipart),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "An error occurred";
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.detail || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Authentication
  register: (body: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (formData: URLSearchParams) => {
    return fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    }).then(async (res) => {
      if (!res.ok) {
        const txt = await res.text();
        let err = "Login failed";
        try {
          err = JSON.parse(txt).detail || err;
        } catch {}
        throw new Error(err);
      }
      return res.json();
    });
  },
  getMe: () => request<any>("/auth/me"),
  updateMe: (body: any) => request<any>("/auth/me", { method: "PUT", body: JSON.stringify(body) }),

  // Dashboard
  getDashboardSummary: () => request<any>("/dashboard/summary"),

  // Skills
  getSkills: () => request<any[]>("/skills"),
  triggerGapAnalysis: () => request<any>("/skills/gap-analysis", { method: "POST" }),
  updateSkillStatus: (skillId: number, status: string) => 
    request<any>(`/skills/${skillId}`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Roadmap
  getRoadmap: () => request<any[]>("/roadmap"),
  generateRoadmap: () => request<any[]>("/roadmap/generate", { method: "POST" }),
  updateTaskStatus: (taskId: number, status: string) => 
    request<any>(`/roadmap/tasks/${taskId}`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Resume
  analyzeResume: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<any>("/resume/analyze", {
      method: "POST",
      body: formData
    });
  },
  getResumeHistory: () => request<any[]>("/resume/history"),

  // Career Coach
  getChatHistory: () => request<any[]>("/coach/history"),
  sendChatMessage: (content: string) => 
    request<any>("/coach/chat", { method: "POST", body: JSON.stringify({ role:"user",content }) }),
};
