import { Injectable, Inject } from "@angular/core";
// import { DynamoDBService } from "./ddb.service";
import { environment } from "../environments/environment";

declare var AWS: any;

export interface S3serviceCallback {
   s3serviceCallback(message: string, result: any): void;
}

@Injectable()

export class S3service {

   constructor () {}

   private getS3(): any {
       AWS.config.update({
           region: environment.bucketRegion
       });

       var s3 = new AWS.S3({
           region: environment.bucketRegion,
           apiVersion: '2006-03-01',
           params: {Bucket: environment.rekognitionBucket}
       });

       return s3
   }

   public addPhoto(selectedFile, filename, callback: S3serviceCallback): void {

       if (!selectedFile) {
           console.log('Please choose a file to upload first.');
           return;
       }
      //  let ext = selectedFile.name.split('.')[1];

       let photoKey = environment.albumName + "/" + filename +'.jpg';


       var buf = this.dataURLtoBlob(selectedFile);

       var data = {
          Key: photoKey,
          Body: buf,
          ContentType: 'image/jpeg'
       };

       this.getS3().upload(data, function (err, data) {
           if (err) {
               console.log('There was an error uploading your photo: ', err);
               callback.s3serviceCallback(err, null);
           } else {
             console.log('Successfully uploaded photo.',data);
             callback.s3serviceCallback(null, data);
           }
       });
   }

   public deletePhoto(albumName, photoKey) {
       this.getS3().deleteObject({Key: photoKey}, function (err, data) {
           if (err) {
               console.log('There was an error deleting your photo: ', err.message);
               return;
           }
           console.log('Successfully deleted photo.');
       });
   }

   public viewAlbum(albumName) {
       var albumPhotosKey = encodeURIComponent(environment.albumName) + '//';
       this.getS3().listObjects({Prefix: albumPhotosKey}, function (err, data) {
           if (err) {
               console.log('There was an error viewing your album: ' + err);
           }

       });
   }

  dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
  }
  
}
