var AWS = require('aws-sdk');
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();

exports.handler = (event, context) => {
    dynamo.scan({
      TableName: "groups",
    }, function (err, data) {
      if (err) {
        context.fail(err);
      } else {
        var result = {result: "succeed", data: data}
        context.succeed(result);
      }
    });
};
