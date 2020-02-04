import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];

  public async addNewToGallery() {
    //Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100 // highest quality (0 to 100)
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);
  
  }

  private async savePicture(cameraPhoto: CameraPhoto) { 
    // Convert photo to base64 format, required by Filesystem API to save
     const base64Data = await this.readAsBase64(cameraPhoto);

     //Write the file to the data dictionary
     const fileName = new Date().getTime() + '.jpeg';
     await Filesystem.writeFile({
       path: fileName,
       data: base64Data,
       directory: FilesystemDirectory.Data
     });

     //Get platform-specific photo filepaths
     return await this.getPhotoFile(cameraPhoto, fileName);
   }
  
  constructor() { }
}

interface Photo {
  filepath: string;
  webviewPath: string;
  base64?: string;
}