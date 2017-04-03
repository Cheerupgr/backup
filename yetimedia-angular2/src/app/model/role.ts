export class Role {
    // public static DOCTOR = "DOCTOR";
    // public static NURSE = "NURSE";
    // public static ADMIN = "ADMIN";
    // public static CAREGIVER = "CAREGIVER";
    // public static CASE_MANAGER = "CASE_MANAGER";
    // public static CARE_TEAM = "DOCTOR";
    // public static FAMALY_MEMBER = "FAMALY_MEMBER";
    public static DOCTOR = "doctor";
    public static NURSE = "nurse";
    public static ADMIN = "admin";
    public static CAREGIVER = "caregiver";
    public static CASE_MANAGER = "case_manager";
    public static CARE_TEAM = "doctor";
    public static FAMALY_MEMBER = "family_member";

    public static ALL = [
        Role.DOCTOR,
        Role.NURSE,
        Role.ADMIN,
        Role.CAREGIVER,
        Role.CASE_MANAGER,
        Role.CARE_TEAM,
        Role.FAMALY_MEMBER
    ];
}
