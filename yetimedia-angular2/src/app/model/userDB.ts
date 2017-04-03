// import { Injectable } from "@angular/core";
// import { DynamoDBService } from "../service/ddb.service";
// import { User } from "./user";
//
// @Injectable()
// export class UserDB {
//     public ddb: DynamoDBService;
//
//     constructor(ddb: DynamoDBService) {
//         this.ddb = ddb;
//         this.ddb.setTableName('Users');
//     }
//
//     create(user: User): Promise<User> {
//         return this.ddb.create(user);
//     }
//
//     all(): Promise<Array<User>> {
//         return this.ddb.all();
//     }
// }
