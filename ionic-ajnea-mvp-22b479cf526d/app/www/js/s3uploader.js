////////////////////SAve on S3
// look at tutotial at http://coenraets.org/blog/2013/09/how-to-upload-pictures-from-a-phonegap-app-to-amazon-s3/

var s3Uploader = (function () {

  var s3URI = encodeURI("https://victoriseappdata.s3.amazonaws.com/"),
    policyBase64 = "eyJleHBpcmF0aW9uIjoiMjAyMC0xMi0zMVQxMjowMDowMC4wMDBaIiwiY29uZGl0aW9ucyI6W3siYnVja2V0IjoidmljdG9yaXNlYXBwZGF0YSJ9LFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl0seyJhY2wiOiJwdWJsaWMtcmVhZCJ9LFsic3RhcnRzLXdpdGgiLCIkQ29udGVudC1UeXBlIiwiIl0sWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCw1MjQyODgwMDAwXV19",
    signature = "vufL9yR2nKsN4KCALcw/kiuyHlc=",
    awsKey = 'AKIAJOYETLIX7ED4HWEQ',
    acl = "public-read";

  function upload(fileURI, fileName, type) {

    var deferred = $.Deferred(),
      ft = new FileTransfer(),
      options = new FileUploadOptions();

    options.fileKey = "file";
    options.fileName = fileName;
    options.mimeType = "text/xml";
    options.chunkedMode = false;
    options.params = {
      "key": fileName,
      "AWSAccessKeyId": awsKey,
      "acl": acl,
      "policy": policyBase64,
      "signature": signature,
      "Content-Type": type
    };

    ft.upload(fileURI, s3URI,
      function (e) {
        deferred.resolve(e);
      },
      function (e) {
        deferred.reject(e);
      }, options);

    return deferred.promise();

  }

  return {
    upload: upload
  }

}());
