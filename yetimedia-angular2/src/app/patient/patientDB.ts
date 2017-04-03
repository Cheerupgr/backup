import { Injectable } from "@angular/core";
import { DynamoDBService } from "../shared/ddb.service";
import { Patient } from "./patient";

@Injectable()
export class PatientDB extends DynamoDBService {

    constructor() {
        super('Patients');
    }

    create(patient: Patient): Promise<Patient> {
        return super.create(patient);
    }

    all(): Promise<Array<Patient>> {
        return super.all();
    }
}
