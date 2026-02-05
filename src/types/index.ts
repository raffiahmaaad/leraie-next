// Common types used across the application

export interface Tool {
  name: string;
  description: string;
  icon: string;
  href: string;
  status: "available" | "coming-soon";
  gradient: string;
}

export interface ToastMessage {
  message: string;
  type: "success" | "error";
}
