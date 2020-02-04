import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";

  public async addNewToGallery() {
    //Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100 // highest quality (0 to 100)
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);
  
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos.map(p => {
        // Don't save the base64 representation of the photo data, 
        // since it's already saved on the Filesystem
        const photoCopy = { ...p };
        delete photoCopy.base64;

        return photoCopy;
      }))

    })
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
  
   private async readAsBase64(cameraPhoto: CameraPhoto) { 
     //Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }

    convertBlobToBase64 = (blob: Blob) => new Promise((resolve,reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    })

    private async getPhotoFile(cameraPhoto: CameraPhoto, fileName: string): Promise<Photo> {
      return { 
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
    
    public async loadSaved() {
      // Retrieve cached photo array data
      const photos = await Storage.get({
        key:this.PHOTO_STORAGE
      })  ;
      this.photos = JSON.parse(photos.value) || [];
      
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });

        //Web Platform only: Save the photo into the base64 format
        photo.base64 = 'data:image/jpeg; bsae64, ${readFile.data}';
      }


    }

  constructor() { }
}

interface Photo {
  filepath: string;
  webviewPath: string;
  base64?: string;
}