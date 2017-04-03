declare var AWS: any;
declare var AWSCognito: any;

export class DynamoDBService {
    tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    all(): Promise<any> {

        var DDB = new AWS.DynamoDB.DocumentClient(),
            params = {
                TableName: this.tableName
            };

        return new Promise((resolve, reject) => {
            DDB.scan(params, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.Items);
                }
            });
        });
    }

    query(params): Promise<any> {

        var DDB = new AWS.DynamoDB.DocumentClient();

        params.TableName = this.tableName;

        return new Promise((resolve, reject) => {
            DDB.query(params, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.Items);
                }
            })
        })
    }

    create(item: any): Promise<any> {
      // var testitem = {id:item.userid, name: item.name, photo: '1', email:"aaa"};
      //   var DDB = new AWS.DynamoDB.DocumentClient(),
      //       itemParams = {
      //           TableName: this.tableName,
      //           Item: testitem
      //       };
      //
      //   return new Promise((resolve, reject) => {
      //       DDB.put(itemParams, function (error, result) {
      //           if (error) {
      //               reject(error);
      //           } else {
      //               resolve(result);
      //           }
      //       });
      //   });

        var DDB = new AWS.DynamoDB.DocumentClient(),
            itemParams = {
                TableName: this.tableName,
                Item: item
            };

        return new Promise((resolve, reject) => {
            DDB.put(itemParams, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
