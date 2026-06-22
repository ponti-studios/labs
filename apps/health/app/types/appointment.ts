export type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  location: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
};
