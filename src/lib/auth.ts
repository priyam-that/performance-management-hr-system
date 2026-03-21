export type UserRole = "manager" | "employee";

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export const USERS: User[] = [
  { email: "manager@crystal.com", name: "Sarah Manager", role: "manager" },
  { email: "amit.das@crystal.com", name: "Amit Das", role: "employee" },
  { email: "rahul.kumar@crystal.com", name: "Rahul Kumar", role: "employee" },
  { email: "sumit.mondal@crystal.com", name: "Sumit Mondal", role: "employee" },
  { email: "rakesh.banerjee@crystal.com", name: "Rakesh Banerjee", role: "employee" },
  { email: "priyam.manna@crystal.com", name: "Priyam Manna", role: "employee" },
  { email: "abhinav.singh@crystal.com", name: "Abhinav Singh", role: "employee" },
  { email: "vikas.yadav@crystal.com", name: "Vikas Yadav", role: "employee" },
  { email: "manish.sharma@crystal.com", name: "Manish Sharma", role: "employee" },
  { email: "sneha.chatterjee@crystal.com", name: "Sneha Chatterjee", role: "employee" },
  { email: "riya.mukherjee@crystal.com", name: "Riya Mukherjee", role: "employee" },
  { email: "sourav.bose@crystal.com", name: "Sourav Bose", role: "employee" },
  { email: "neha.mishra@crystal.com", name: "Neha Mishra", role: "employee" },
  { email: "puja.pandey@crystal.com", name: "Puja Pandey", role: "employee" },
  { email: "sanjay.prasad@crystal.com", name: "Sanjay Prasad", role: "employee" },
  { email: "rohit.gupta@crystal.com", name: "Rohit Gupta", role: "employee" },
  { email: "nidhi.jha@crystal.com", name: "Nidhi Jha", role: "employee" },
  { email: "amit.sinha@crystal.com", name: "Amit Sinha", role: "employee" },
  { email: "anjali.ghosh@crystal.com", name: "Anjali Ghosh", role: "employee" },
  { email: "rajesh.sen@crystal.com", name: "Rajesh Sen", role: "employee" },
  { email: "priyanka.roy@crystal.com", name: "Priyanka Roy", role: "employee" },
  { email: "sandeep.kumar@crystal.com", name: "Sandeep Kumar", role: "employee" },
];

export function getUserByEmail(email: string): User | undefined {
  return USERS.find((u) => u.email === email);
}
