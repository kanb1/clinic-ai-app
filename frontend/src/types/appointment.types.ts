export interface IPersonMini {
  _id: string;
  name: string;
}

export interface IAppointment {
  _id: string;
  patient_id: IPersonMini;
  doctor_id: IPersonMini;
  date: string; // ISO timestamp
  time: string; // fx "10:30"
  end_time: string;
  status: "bekræftet" | "aflyst" | "udført" | "venter";
  secretary_note?: string;
}
