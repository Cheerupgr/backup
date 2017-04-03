import { User } from "./user";
import { Role } from "./role";

export class FamilyMember extends User {
    patientOf: string;
    role = Role.FAMALY_MEMBER;
}
