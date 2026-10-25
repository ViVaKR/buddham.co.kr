import { Routes } from '@angular/router';
import { Paths } from '@app/data/menu-data';

export const buddhaRoutes: Routes = [
  {
    /**
     * 삐따까
     * 경전의 그릇 / 메타 데이터
     */
    path: Paths.Pitaka.url,
    loadChildren: () => import('@pages/pitaka/pitaka.routes'),
  },
  {
    /**
     * 수뜨라
     * 정제된 기전체 형식의 정전 모음
     */
    path: Paths.Sutra.url,
    loadChildren: () => import('@pages/sutra/sutra.routes'),
  },
  {
    /**
     * 레카나
     * 사경 수행 마당
     */
    path: Paths.Lekhana.url,
    loadChildren: () => import('@pages/lekhana/lekhana.routes'),
  },
  {
    /**
     * 담마
     * 새롭게 생성된 현재의 법 법문, 음성 영상 등 모괄적의 현재의 경전
     */
    path: Paths.Dhamma.url,
    loadChildren: () => import('@pages/dhamma/dhamma.routes'),
  },
  {
    /**
     * 캐넌
     * 대한민구 또는 세계에서 공인된 정전 모음
     */
    path: Paths.Canon.url,
    loadChildren: () => import('@pages/canon/canon.routes'),
  },
  {
    path: Paths.Chat.url,
    loadChildren: () => import('@pages/chat/chat.routes')
  },
  {
    path: Paths.DailySutra.url,
    loadChildren: () => import('@pages/daily-sutra/daily-sutra.routes'),
  },

  {
    path: Paths.Help.url,
    loadChildren: () => import('@pages/help/help.routes'),
  },
  {
    path: Paths.Guide.url,
    loadChildren: () => import('@pages/guide/guide.routes'),
  },
  {
    path: Paths.DharmaChat.url,
    loadChildren: () => import('@pages/dharma-chat/dharma-chat.routes')
  },
  {
    path: Paths.AppleSyscall.url,
    loadChildren: () => import('@pages/apple-syscall/apple-syscall.routes')
  },
    {
        path: Paths.DhammaChat.url,
        loadChildren: () => import('@pages/dhamma-chat/dhamma-chat.routes')
    },
] as Routes;
