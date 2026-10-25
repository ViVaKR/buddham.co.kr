import { Component } from '@angular/core';
import { BaseService } from '@app/core/services/base/base.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from "@app/layout/body-layout/body-layout";
import { TitleLayout } from "@app/layout/title-layout/title-layout";

@Component({
  selector: 'user-info-mandala',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './user-info-mandala.html',
  styleUrl: './user-info-mandala.scss',
})
export default class UserInfoMandala extends BaseService {

  title = Paths.UserInfo.ko;
  color = Paths.UserInfo.color;


  goToVipassana(id: string) {
    this.navigator.to([`${Paths.Auth.url}/karma`, id]);
  }
}
