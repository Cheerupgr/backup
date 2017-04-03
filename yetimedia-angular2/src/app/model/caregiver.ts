import { User } from "./user";
import { Role } from "./role";
import { BasicCaregiver } from "./basic-caregiver";

export class Caregiver extends User {
    patientsList: any;
    role?: string = Role.CAREGIVER;
}
