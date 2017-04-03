var AWS = require('aws-sdk');
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();

exports.handler = (event, context) => {
    var scanParam = {TableName: "Patients"};
    var filterExpStr = "";
    var filterAttr = {};
    var query_count = 0;

    var get_cb = function(err, data) {
      if (err) {
        context.fail(err);
      } else {
        context.succeed(data);
      }
    };

    var completeFilter = function () {
      if (query_count) {
        scanParam.FilterExpression = filterExpStr;
        scanParam.ExpressionAttributeValues = filterAttr;
      }
      console.log(scanParam);
      dynamo.scan(scanParam, get_cb);
    }

    createFilterForGroup = function (items) {
      var idStrTmp = "";
      for (var i = 0; i < items.length; i++) {
        if (query_count) filterExpStr += " OR ";
        idStrTmp = ":id"+i;
        filterExpStr += "id = " + idStrTmp;
        filterAttr[idStrTmp] = items[i].patient_id;
        query_count++;
      }
      completeFilter();
    };

    var getGroupPatients_cb = function (err, data) {
      if (err) {
        context.fail(err);
      } else if (data.Items.length) {
        createFilterForGroup(data.Items);
      } else {
        context.fail('no patients');
      }
    };

    var createFilter = function (query) {
      if (query.group_id) {
        var scanParamForGroupPatient = {TableName: "group_patient"};
        var filterAttrForGroupPatient = {};
        filterExpStrForGroupPatient = "group_id = :group_id";
        filterAttrForGroupPatient[":group_id"] = query.group_id;
        scanParamForGroupPatient.FilterExpression = filterExpStrForGroupPatient;
        scanParamForGroupPatient.ExpressionAttributeValues = filterAttrForGroupPatient;
        dynamo.scan(scanParamForGroupPatient, getGroupPatients_cb);
      } else {
        completeFilter();
      }
    };

    if (event.query && JSON.stringify(event.query) !== JSON.stringify({})) {
      createFilter(event.query);
    }
};
