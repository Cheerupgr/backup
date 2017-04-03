import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class PatientService {

  public serverUrl: string = 'https://ex686v7eq1.execute-api.us-east-1.amazonaws.com/test/patient';

  constructor (
    private http: Http
  ) {}

  getPatients (params) {
    var requestUrl = this.serverUrl + '?';
    for (var k in params) {
      requestUrl += k;
      requestUrl += '=';
      requestUrl += params[k];
      requestUrl += '&';
    }
    return this.http.get(requestUrl)
    .map((res:Response) => res.json());
  }

  createPatient (patient) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(patient);
    return this.http.post(this.serverUrl, body, options)
               .map((res: Response) => res.json());
  }

  // deletePatient (patient) {
  //   let headers = new Headers({ 'Content-Type': 'application/json' });
  //   let body = JSON.stringify(patient);
  //   let options = new RequestOptions({
  //     headers: headers,
  //     body: body
  //   });
  //
  //   return this.http.delete(this.serverUrl, options)
  //              .map((res: Response) => res.json());
  // }
}
