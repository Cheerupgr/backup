////////////////////SAve on S3
// look at tutotial at http://coenraets.org/blog/2013/09/how-to-upload-pictures-from-a-phonegap-app-to-amazon-s3/

var s3Downloader = (function () {

  AWS.config.update({
    accessKeyId: "AKIAJOYETLIX7ED4HWEQ",
    secretAccessKey: "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"
  });

  function download(filename) {

    var deferred = $.Deferred();

    var s3 = new AWS.S3();
    var params = {
      "Bucket": 'victoriseappdata',
      "Key": filename
    };

    s3.getObject(params, function(err, data) {
      if (err) return deferred.reject(err);
      var response = JSON.parse(data.Body.toString());
      return deferred.resolve(response);
    });

    return deferred.promise();

  }

  return {
    download: download
  }

}());
