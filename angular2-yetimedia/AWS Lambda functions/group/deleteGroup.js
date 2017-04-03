var AWS = require('aws-sdk');
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();

exports.handler = (event, context) => {
    if (!event.id) {
        context.fail('Missing Parameters');
    }

    var item = event;

    var delete_cb = function (err, data) {
      if (err) {
          context.fail(err);
      } else {
          var result = {result: "success", item: item};
          context.succeed(result);
      }
    };

    var validate_cb = function (err, data) {
        console.log(data);
        if (err) {
            context.fail(err);
        } else if (Object.keys(data).length === 0) {
            context.fail('No items found.');
        } else {
            dynamo.deleteItem({
                "TableName": "groups",
                "Key": {id: item.id}
            }, delete_cb);
        }
    };

    dynamo.getItem({
        TableName: "groups",
        Key: {id: item.id}
    }, validate_cb);
};
