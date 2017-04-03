import { User } from "./user";
import { Role } from "./role";
import { BasicCaregiver } from "./basic-caregiver";

export class Admin extends User {
    // patientsList: Array<string>;
    role?:string = Role.ADMIN;


}
