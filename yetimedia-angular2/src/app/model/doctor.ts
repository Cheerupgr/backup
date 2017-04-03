import { User } from "./user";
import { Role } from "./role";
import { SpecialistType } from "./specialist-type";
import { BasicCaregiver } from "./basic-caregiver";

export class Doctor extends User {
    specialistType: SpecialistType;
    patientsList?: any;
    role:string;
}
