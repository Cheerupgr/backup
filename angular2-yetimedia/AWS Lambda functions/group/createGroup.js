var AWS = require('aws-sdk');
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();

exports.handler = (event, context) => {
    function generateID () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    var item = {
        id: generateID(),
        name: event.name
    };

    dynamo.putItem({
       "TableName": "groups",
       "Item": item
    }, function (err, data) {
        if (err) {
            context.fail(err);
        } else {
            var result = {result: "success", item: item};
            context.succeed(result);
        }
    });
};
