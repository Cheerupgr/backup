import { User } from '../model/user';
import { PatientStatus } from './patient-status'
import { MedicalHistory } from './medical-history'
import { ActivityAlert } from './activity-alert'
import { Allergy } from './allergy'
import { Medication } from './medication'
import { Group } from './group'

export class Patient extends User {
  dob?: String;
  medicare: string;
  status: PatientStatus;
  ssn: string;
  servicingOfficeLocation: string;
  dnrOnFile: boolean;

  medicalHistory ?:Array<MedicalHistory>;
  activityAlerts ?: Array<ActivityAlert>;
  allergies ?: Array<Allergy>;
  medications ?: Array<Medication>;
  groups ?: Array<Group>;
  taskListIds ?: Array<string>;
}
