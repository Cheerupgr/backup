import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class GroupService {

  public serverUrl: string = 'https://ex686v7eq1.execute-api.us-east-1.amazonaws.com/test/group';

  constructor (
    private http: Http
  ) {}

  getGroups () {
    var retVal;
    retVal = this.http.get(this.serverUrl)
    .map((res:Response) => res.json());
    return retVal;
  }

  createGroup (group) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(group);
    return this.http.post(this.serverUrl, body, options)
               .map((res: Response) => res.json());
  }

  deleteGroup (group) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body = JSON.stringify(group);
    let options = new RequestOptions({
      headers: headers,
      body: body
    });

    return this.http.delete(this.serverUrl, options)
               .map((res: Response) => res.json());
  }
}
