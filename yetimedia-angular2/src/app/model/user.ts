import { UUID } from 'angular2-uuid';

export class User {
  id?: string;
  name: string;
  email: string;
  userid: string;
  password?: string;
  address: string;
  phoneH: string;
  phoneC: string;
  photo: string;

    constructor(name: string, photo: string) {
        this.id = UUID.UUID();
        this.name = name;
        this.photo = photo;
    }
}
