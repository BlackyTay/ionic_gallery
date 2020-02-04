import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})


export class Tab2Page {

  ngOnInit() {
    this.photoService.loadSaved();
  }
  constructor(public photoService: PhotoService, 
              public actionSheetController: ActionSheetController) {}

}
