import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class GroupPatientService {

  public serverUrl: string = 'https://ex686v7eq1.execute-api.us-east-1.amazonaws.com/test/group-patient';

  constructor (
    private http: Http
  ) {}

  // getGroupPatients () {
  //   var retVal;
  //   retVal = this.http.get(this.serverUrl)
  //   .map((res:Response) => res.json());
  //   return retVal;
  // }

  createGroupPatient (group_patient) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(group_patient);
    return this.http.post(this.serverUrl, body, options)
               .map((res: Response) => res.json());
  }

  // deleteGroupPatient (group_patient) {
  //   let headers = new Headers({ 'Content-Type': 'application/json' });
  //   let body = JSON.stringify(group_patient);
  //   let options = new RequestOptions({
  //     headers: headers,
  //     body: body
  //   });
  //
  //   return this.http.delete(this.serverUrl, options)
  //              .map((res: Response) => res.json());
  // }
}
