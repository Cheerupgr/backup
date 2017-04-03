import { User } from "./user";
import { Role } from "./role";
import { BasicCaregiver } from "./basic-caregiver";

export class Nurse extends User {
    role?:any = Role.NURSE;
}
